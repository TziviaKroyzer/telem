import React from "react";
import { Check } from "lucide-react";

const ConfirmationModal = ({ onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="confirm-check">
        <Check size={28} strokeWidth={2.4} />
      </div>
      <h3 className="modal-title">ההערה נוספה בהצלחה</h3>
    </div>
    <style>{`
      .confirm-check {
        width: 56px;
        height: 56px;
        margin: 0 auto 14px;
        border-radius: 999px;
        background: #EDF7F1;
        color: #2F7D55;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `}</style>
  </div>
);

export default ConfirmationModal;
