import React from "react";

export default function AppNotice({ title = "הודעה", message, onClose }) {
  if (!message) return null;

  return (
    <div className="app-notice-overlay" onClick={onClose}>
      <div className="app-notice" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="app-notice-actions">
          <button className="btn" type="button" onClick={onClose}>
            אישור
          </button>
        </div>
      </div>
      <style>{`
        .app-notice-overlay {
          position: fixed;
          inset: 0;
          background: rgba(18,32,58,.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1300;
          padding: 16px;
        }
        .app-notice {
          width: 100%;
          max-width: 440px;
          background: #FFFEFB;
          border: 1px solid #EDE9E3;
          border-radius: 24px;
          box-shadow: 0 18px 40px rgba(18,32,58,.16);
          padding: 1.4rem 1.5rem 1.25rem;
          direction: rtl;
          text-align: right;
        }
        .app-notice h3 {
          margin: 0 0 10px;
          font-size: 1.15rem;
          font-weight: 800;
          color: #12203A;
        }
        .app-notice p {
          margin: 0 0 18px;
          font-size: .95rem;
          line-height: 1.55;
          color: #12203A;
          white-space: pre-line;
        }
        .app-notice-actions {
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
}
