import { useEffect } from 'react';

// ─── Confirmation Modal Component ─────────────────────────────────────────────
const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {

  // ESC key close
  useEffect(() => {

    const handleEsc = (e) => {

      if (e.key === 'Escape') {
        onClose();
      }

    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };

  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="confirm-overlay"
      onClick={onClose}
    >

      <div
        className="confirm-modal"
        onClick={(e) => e.stopPropagation()}
      >

        <h3>Confirm!</h3>

        <p>{message}</p>

        <div className="confirm-actions">

          <button
            type="button"
            className="btn danger"
            onClick={onConfirm}
          >
            Yes
          </button>

          <button
            type="button"
            className="btn secondary"
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