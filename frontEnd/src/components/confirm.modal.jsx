const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="overlay"
      onClick={onClose}
    >
      <div
        className="modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <h3>Confirm</h3>

        <p>{message}</p>

        <div className="modal-actions">
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