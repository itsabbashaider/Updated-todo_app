import { useState } from 'react';

function TaskModal({
  open,
  onClose,
  onAddTask,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] =
    useState('');

  const [priority, setPriority] =
    useState('Low');

  const [date, setDate] = useState('');

  if (!open) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;

    onAddTask({
      title,
      description,
      priority,
      date,
      completed: false,
    });

    setTitle('');
    setDescription('');
    setPriority('Low');
    setDate('');

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="task-modal">
        <div className="modal-header">
          <h2>Create Task</h2>

          <button onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />

          <textarea
            placeholder="Task description"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
          />

          <button
            className="create-task-btn"
            onClick={handleSubmit}
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;