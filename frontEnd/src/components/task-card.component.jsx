// ─── Task Card Component ──────────────────────────────────────────────────────
function TaskCard({ task, onToggle, onEdit, onDelete, onViewDetail }) {
  
  return (
    <div className="task-card" onClick={() => onViewDetail?.(task)}>
      
      {/* Status Badge */}
      <span className={task.completed ? 'completed-label' : 'pending-label'}>
        {task.completed ? 'COMPLETED' : 'PENDING'}
      </span>

      {/* Title */}
      <h3 className={task.completed ? 'completed' : ''}>
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p>
          {task.description.length > 80
            ? `${task.description.slice(0, 80)}...`
            : task.description}
        </p>
      )}

      {/* Actions */}
      <div className="task-actions">
        
        {/* Toggle Complete */}
        <button
          type="button"
          className="btn success"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task);
          }}
        >
          {task.completed ? '↩' : '✓'}
        </button>

        {/* Edit */}
        <button
          type="button"
          className="btn warning"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          disabled={task.completed}
        >
          ✎
        </button>

        {/* Delete */}
        <button
          type="button"
          className="btn danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task);
          }}
        >
          ✕
        </button>

      </div>

    </div>
  );
}

export default TaskCard;