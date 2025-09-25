// src/components/Error.js
import React, { useEffect } from "react";
import "./Error.css";

export default function Error({ message, type = "error", onClose }) {
  useEffect(() => {
    if (message && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`message-container ${type}`}>
      <span>{message}</span>
      {onClose && (
        <button className="message-close-btn" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
}
