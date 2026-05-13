// ─── Task Detail Modal Component ──────────────────────────────────────────────
function TaskDetailModal({ isOpen, onClose, task }) {
  
  if (!isOpen || !task) return null;

  return (
    <div className="modal-overlay">
      
      <div className="modal-box detail-modal">
        
        <h2>{task.title}</h2>

        {/* Description */}
        <div className="detail-section">
          <strong>Description:</strong>
          <p>{task.description || 'No description'}</p>
        </div>

        {/* Status */}
        <div className="detail-section">
          <strong>Status:</strong>
          <p>{task.completed ? 'Completed' : 'Pending'}</p>
        </div>

        {/* Created Date */}
        <div className="detail-section">
          <strong>Created:</strong>
          <p>{new Date(task.createdAt).toLocaleString()}</p>
        </div>

        {/* Completed Date */}
        {task.completed_at && (
          <div className="detail-section">
            <strong>Completed At:</strong>
            <p>{new Date(task.completed_at).toLocaleString()}</p>
          </div>
        )}

        {/* Close Button */}
        <button type="button" className="btn close-btn" onClick={onClose}>
          Close
        </button>

      </div>

    </div>
  );
}

export default TaskDetailModal;