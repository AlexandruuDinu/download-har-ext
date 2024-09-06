# HAR Downloader Chrome Extension
This Chrome extension allows users to capture network traffic and automatically download the captured data in the form of a HAR (HTTP Archive) file. The HAR file includes detailed information about each network request and response made while browsing a website.

## Features
- Automatically captures network requests and responses from the active tab.

- Generates a HAR file with detailed request and response information, including headers, content, and timing data.

- Ability to start and stop network capturing via a simple popup interface.

- Downloads the captured HAR file as a .har file for analysis.

- Useful for web performance analysis, debugging, or tracking network traffic.

### How to Install
1. **Download the Extension Files**: Clone or download the repository to your local machine.

2. **Open Chrome Extensions Page**:

    - Open a new tab in Chrome and navigate to chrome://extensions/.
    - Enable Developer mode (toggle switch in the top-right corner).
3. **Load the Unpacked Extension**:

    - Click Load unpacked and select the folder where you downloaded or cloned the extension files.
    - The extension will now be visible in the list of installed extensions.

4. **Use the Extension**:

    - Click the extension icon in the Chrome toolbar.
    - Use the popup to start capturing network traffic.
    - Browse the website you wish to monitor.
    - Click the Stop Capture button to stop monitoring and download the HAR file.


### How to Use

1. **Start Capture**: Click on the extension icon in the Chrome toolbar and click the "Start Capture" button.
2. **Browse Website**: Navigate through any website you want to capture network traffic for.
3. **Stop Capture**: Once you're done, click the "Stop Capture" button to stop network traffic monitoring.
4. **Download HAR File**: The extension will automatically generate and download the HAR file as network-log.har.

### Example HAR Entry

Each entry in the HAR file contains the following data:

```json
{
  "startedDateTime": "2024-09-06T16:04:22.152Z",
  "request": {
    "method": "GET",
    "url": "https://example.com/api/resource",
    "headers": {...}
  },
  "response": {
    "status": 200,
    "headers": {...},
    "content": {
      "mimeType": "application/json",
      "size": 1234
    }
  },
  "timings": {
    "send": 0,
    "wait": 120,
    "receive": 30
  }
}
```

### Permissions
This extension requires the following permissions:

- **activeTab**: Allows the extension to access the currently active tab and capture network events.

- **debugger**: The extension uses the Chrome Debugger API to capture network traffic.

- **downloads**: The extension needs access to the Chrome Downloads API to download the HAR file.

### Known Issues
- Some resources might be blocked due to security or privacy settings, such as ad blockers, privacy extensions, or content security policies.

- The extension may not capture all network requests if a site uses certain security restrictions (e.g., CORS or CSP headers).

- Errors related to ERR_BLOCKED_BY_CLIENT or 403 Forbidden indicate that certain resources are blocked due to security settings on the website or by extensions like ad blockers.

### Troubleshooting
- **403 Forbidden Errors**: This error may occur if you are trying to access a restricted resource. Ensure that you have permission to access the requested resource or try disabling ad blockers.

- **ERR_BLOCKED_BY_CLIENT**: This error is usually caused by privacy extensions or content blockers. Disable these extensions temporarily to capture the traffic.

- **Storage Access Denied**: Some websites may block access to storage (cookies, local storage) due to privacy settings. This error can generally be ignored if it does not impact your capture.

- **Passive Event Listener Warning**: If you see warnings about passive event listeners, these are typically warnings from the website's code, not your extension. They can be ignored.

### Contribution
If you'd like to contribute or improve the functionality of this extension:

1. Fork the repository.

2. Make your changes.

3. Submit a pull request for review.

### License
This project is licensed under the MIT License.