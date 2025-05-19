import React from "react";

const ConfirmationModal = ({ onClose }) => (
  <>
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">ההערה נוספה בהצלחה!</h3>
        {/* <button className="modal-button" onClick={onClose}>סגור</button> */}
      </div>
    </div>

    <style>{`
      .modal-overlay {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 50;
      }

      .modal-content {
        background-color: white;
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        max-width: 24rem;
        width: 100%;
        text-align: center;
      }

      .modal-title {
        font-size: 1.125rem;
        font-weight: bold;
        margin-bottom: 1rem;
      }

      .modal-button {
        margin-top: 1rem;
        background-color: #16a34a;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        transition: background-color 0.2s ease-in-out;
        border: none;
        cursor: pointer;
      }

      .modal-button:hover {
        background-color: #15803d;
      }
    `}</style>
  </>
);

export default ConfirmationModal;
