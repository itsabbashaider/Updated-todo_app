// ─── Validation Error Modal Component ─────────────────────────────────────────
function ValidationErrorModal({ isOpen, message, onClose }) {
  
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      
      <div className="modal-content">
        
        <h2 className="modal-title">⚠️ Invalid Input</h2>
        <p className="modal-message">{message}</p>

        <div className="modal-actions">
          <button type="button" className="btn primary" onClick={onClose}>
            OK
          </button>
        </div>

      </div>

    </div>
  );
}

export default ValidationErrorModal;