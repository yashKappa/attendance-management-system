import React from "react";
import "./PopUp.css";

export default function PopUp({ message, onConfirm, onCancel }) {
  if (!message) return null; // do not render if no message

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <p>{message}</p>
        <div className="popup-buttons">
          <button className="popup-confirm" onClick={onConfirm}>
            Yes
          </button>
          <button className="popup-cancel" onClick={onCancel}>
            No
          </button>
        </div>
      </div>
    </div>
  );
}
