import React from "react";

const ConfirmationModal = ({ onClose }) => (
  <>
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">ההערה נוספה בהצלחה!</h3>
        {/* <button className="modal-button" onClick={onClose}>סגור</button> */}
      </div>
    </div>


  </>
);

export default ConfirmationModal;
