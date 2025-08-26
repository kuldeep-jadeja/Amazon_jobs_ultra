import React from "react";

const Popup = () => {
  const sendMessageToBackground = (action) => {
    chrome.runtime.sendMessage({ action }, (response) => {
      console.log(`Job search ${action}:`, response?.status);
    });
  };

  return (
    <div style={{ padding: "10px", minWidth: "150px" }}>
      <h3>Job Search</h3>
      <button onClick={() => sendMessageToBackground("startJobSearch")} style={{ marginRight: "10px" }}>
        Start
      </button>
      <button onClick={() => sendMessageToBackground("stopJobSearch")}>
        Stop
      </button>
    </div>
  );
};

export default Popup;
