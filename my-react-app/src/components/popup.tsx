import React from "react";
import "./Popup.css";

type PopupProps = {
  isOpen: boolean;
  question: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
};

const Popup: React.FC<PopupProps> = ({
  isOpen,
  question,
  onConfirm,
  onCancel,
  confirmText = "Yes",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onCancel}>
      <div className="popup-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="popup-question">{question}</h2>

        <div className="popup-buttons">
          <button className="popup-button popup-cancel" onClick={onCancel}>
            {cancelText}
          </button>

          <button className="popup-button popup-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
