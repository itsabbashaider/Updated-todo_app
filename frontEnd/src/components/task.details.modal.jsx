function TaskDetailModal({
  isOpen,
  onClose,
  task,
}) {
  if (!isOpen || !task) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box detail-modal">
        <h2>{task.title}</h2>

        <div className="detail-section">
          <strong>Description:</strong>

          <p>
            {task.description ||
              "No description"}
          </p>
        </div>

        <div className="detail-section">
          <strong>Status:</strong>

          <p>
            {task.completed
              ? "Completed"
              : "Pending"}
          </p>
        </div>

        <div className="detail-section">
          <strong>Created:</strong>

          <p>
            {new Date(
              task.createdAt
            ).toLocaleString()}
          </p>
        </div>

        {task.completedAt && (
          <div className="detail-section">
            <strong>
              Completed At:
            </strong>

            <p>
              {new Date(
                task.completedAt
              ).toLocaleString()}
            </p>
          </div>
        )}

        <button
          type="button"
          className="btn primary"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default TaskDetailModal;