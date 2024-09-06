let startButton = document.getElementById('startCapture');
let stopButton = document.getElementById('stopCapture');
let tabId;

// Get the current active tab
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tabId = tabs[0].id;
});

// Start button event listener
startButton.addEventListener('click', () => {
    chrome.debugger.attach({ tabId }, "1.3", () => {
        console.log("Debugger attached successfully");
        chrome.debugger.sendCommand({ tabId }, "Network.enable", () => {
            console.log("Network capturing started");
            startButton.disabled = true;
            stopButton.disabled = false;
        });
    });
});

// Stop button event listener
stopButton.addEventListener('click', () => {
    chrome.debugger.sendCommand({ tabId }, "Network.disable", () => {
        console.log("Network capturing stopped");
        chrome.debugger.detach({ tabId }, () => {
            console.log("Debugger detached successfully");
            chrome.runtime.sendMessage({ action: "downloadHAR", tabId: tabId }, (response) => {
                console.log("HAR download initiated", response);
            });
            startButton.disabled = false;
            stopButton.disabled = true;
        });
    });
});
