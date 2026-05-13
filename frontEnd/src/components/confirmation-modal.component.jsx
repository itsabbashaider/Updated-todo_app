// ─── Confirmation Modal Component ─────────────────────────────────────────────
const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onClose}>
      
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        
        <h3>Confirm!</h3>
        <p>{message}</p>

        <div className="confirm-actions">
          
          <button
            type="button"
            className="Yes btn danger"
            onClick={onConfirm}
          >
            Yes
          </button>

          <button
            type="button"
            className="No btn secondary"
            onClick={onClose}
          >
            No
          </button>

        </div>

      </div>

    </div>
  );
};

export default ConfirmModal;