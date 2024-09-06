let networkEvents = {};

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "downloadHAR") {
        const tabId = message.tabId;

        // Log that we're generating the HAR
        console.log("Generating HAR for tab:", tabId);

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
        networkEvents = {};

        // Return true to indicate async response handling
        return true;
    }
});

// Listen to network events when debugging is attached
chrome.debugger.onEvent.addListener((source, method, params) => {
    const requestId = params.requestId;

    if (method === "Network.requestWillBeSent") {
        networkEvents[requestId] = {
            request: params,
            response: null,
            body: null
        };
        console.log("Network request captured:", params.request.url);
    }

    if (method === "Network.responseReceived") {
        if (networkEvents[requestId]) {
            networkEvents[requestId].response = params;
        }
        console.log("Network response received:", params.response.url);
    }

    if (method === "Network.loadingFinished") {
        chrome.debugger.sendCommand(source, "Network.getResponseBody", { requestId: params.requestId }, (responseBody) => {
            if (chrome.runtime.lastError) {
                console.warn("No body available for request:", requestId, chrome.runtime.lastError);
            } else if (networkEvents[requestId]) {
                networkEvents[requestId].body = responseBody;
            }
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
        entries: []
    };

    for (const [requestId, event] of Object.entries(networkEvents)) {
        if (event.request && event.response) {
            harLog.entries.push({
                startedDateTime: new Date(event.request.wallTime * 1000).toISOString(),
                request: {
                    method: event.request.request.method,
                    url: event.request.request.url,
                    headers: event.request.request.headers,
                    queryString: [],
                    postData: event.request.request.postData ? event.request.request.postData.text : "",
                    headersSize: -1,
                    bodySize: -1
                },
                response: {
                    status: event.response.response.status,
                    statusText: event.response.response.statusText,
                    headers: event.response.response.headers,
                    content: {
                        mimeType: event.response.response.mimeType,
                        size: event.response.response.encodedDataLength
                    },
                    headersSize: -1,
                    bodySize: event.response.response.encodedDataLength
                },
                timings: { send: 0, wait: 0, receive: 0 },
                time: 0,
                cache: {},
                pageref: "page_1"
            });
        }
    }

    return { log: harLog };
}
