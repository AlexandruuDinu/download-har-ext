let networkEvents = [];

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "downloadHAR") {
        const tabId = message.tabId;

        // Log that we're generating the HAR
        console.log("Generating HAR for tab:", tabId);

        // If no network events were captured, log a warning
        if (networkEvents.length === 0) {
            console.warn("No network events were captured.");
        } else {
            console.log("Captured network events:", networkEvents);
        }

        // Convert the captured network events to a HAR file format
        const har = createHAR(networkEvents);

        // Use FileReader to convert HAR to base64 for downloading
        const harString = JSON.stringify(har, null, 2); // Prettify the HAR JSON
        const harBlob = new Blob([harString], { type: "application/json" });
        const reader = new FileReader();

        reader.onloadend = function () {
            const base64URL = reader.result;
            chrome.downloads.download({
                url: base64URL,
                filename: "network-log.har",
                saveAs: true
            }, (downloadId) => {
                console.log("HAR file download initiated with ID:", downloadId);
                sendResponse({ success: true });
            });
        };

        reader.readAsDataURL(harBlob); // Convert HAR file to Base64

        // Clear network events for the next session
        networkEvents = [];

        // Return true to indicate async response handling
        return true;
    }
});

// Listen to network events when debugging is attached
chrome.debugger.onEvent.addListener((source, method, params) => {
    if (method === "Network.requestWillBeSent") {
        networkEvents.push({ type: 'request', data: params });
        console.log("Network request captured:", params.request.url);
    }
    if (method === "Network.responseReceived") {
        networkEvents.push({ type: 'response', data: params });
        console.log("Network response received:", params.response.url);
    }
    if (method === "Network.loadingFinished") {
        console.log("Network loading finished for:", params.requestId);
        chrome.debugger.sendCommand(source, "Network.getResponseBody", { requestId: params.requestId }, (responseBody) => {
            networkEvents.push({ type: 'body', data: responseBody });
        });
    }
});

// Helper function to create HAR file from network events
function createHAR(networkEvents) {
    const harLog = {
        version: "1.2",
        creator: { name: "Chrome HAR Capturer", version: "1.0" },
        pages: [{
            startedDateTime: new Date().toISOString(),
            id: "page_1",
            title: "Captured HAR",
            pageTimings: {}
        }],
        entries: networkEvents.map(event => {
            if (event.type === 'request') {
                return {
                    startedDateTime: new Date(event.data.wallTime * 1000).toISOString(),
                    request: {
                        method: event.data.request.method,
                        url: event.data.request.url,
                        headers: event.data.request.headers,
                        queryString: [],
                        postData: event.data.request.postData ? event.data.request.postData.text : "",
                        headersSize: -1,
                        bodySize: -1
                    },
                    response: {},  // Add response details in responseReceived handler
                    timings: { send: 0, wait: 0, receive: 0 },
                    time: 0,
                    cache: {},
                    pageref: "page_1"
                };
            } else if (event.type === 'response') {
                // Add response details here
                return {
                    response: {
                        status: event.data.response.status,
                        statusText: event.data.response.statusText,
                        headers: event.data.response.headers,
                        content: {
                            mimeType: event.data.response.mimeType,
                            size: event.data.response.encodedDataLength
                        },
                        headersSize: -1,
                        bodySize: event.data.response.encodedDataLength
                    }
                };
            }
        })
    };

    return { log: harLog };
}
