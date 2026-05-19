import TaskCard from './task-card.component';

// ─── Task List Component ──────────────────────────────────────────────────────
function TaskList({ tasks, loading, onToggle, onEdit, onDelete, onViewDetail }) {
  
  if (loading) return <p>Loading...</p>;
  if (tasks.length === 0) return <p>No tasks for this day</p>;

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.task_id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  );
}

export default TaskList;