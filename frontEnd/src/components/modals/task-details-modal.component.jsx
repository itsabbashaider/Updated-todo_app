import { useEffect, useRef } from "react";

// ─── Task Detail Modal Component ──────────────────────────────────────────────
function TaskDetailModal({ isOpen, onClose, task }) {

  const modalRef = useRef(null);

  // ESC key close
  useEffect(() => {

    if (!isOpen) return;

    const handleEsc = (e) => {

      if (e.key === 'Escape') {
        onClose();
      }

    };

    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };

  }, [isOpen, onClose]);

  // Click outside close
  useEffect(() => {

    if (!isOpen) return;

    const handleClickOutside = (e) => {

      if (
        modalRef.current &&
        !modalRef.current.contains(e.target)
      ) {
        onClose();
      }

    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };

  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  return (
    <div className="modal-overlay">

      <div
        ref={modalRef}
        className="modal-box detail-modal"
      >

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

          <p>
            {(
              task.created_at ||
              task.createdAt
            )
              ? new Date(
                  task.created_at ||
                  task.createdAt
                ).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'No date'}
          </p>

        </div>

        {/* Completed Date */}
        {(
          task.completed_at ||
          task.completedAt
        ) && (
          <div className="detail-section">

            <strong>Completed At:</strong>

            <p>
              {new Date(
                task.completed_at ||
                task.completedAt
              ).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>

          </div>
        )}

        {/* Close Button */}
        <button
          type="button"
          className="btn close-btn"
          onClick={onClose}
        >
          Close
        </button>

      </div>

    </div>
  );
}

export default TaskDetailModal;