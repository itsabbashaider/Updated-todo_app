import { useState, useCallback } from 'react';
import ConfirmModal from './confirmation-modal.component';

// ─── Edit Modal Component ─────────────────────────────────────────────────────
const EditModal = ({ isOpen, onClose, task, onUpdate }) => {
  
  const [confirmCloseOpen, setConfirmCloseOpen]   = useState(false);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
  const [formData, setFormData]                   = useState({
    title       : task?.title       || '',
    description : task?.description || '',
  });

  // ─── Detect Changes ───────────────────────────────────────────────────────
  const hasChanges =
    formData.title.trim() !== (task?.title || '').trim() ||
    formData.description.trim() !== (task?.description || '').trim();

  // ─── Handle Input Change ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ─── Handle Modal Close ───────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    if (hasChanges) {
      setConfirmCloseOpen(true);
      return;
    }
    onClose();
  }, [hasChanges, onClose]);

  const handleConfirmClose = () => {
    setConfirmCloseOpen(false);
    onClose();
  };

  // ─── Handle Update Click ──────────────────────────────────────────────────
  const handleUpdateClick = () => {
    if (!formData.title.trim()) return;
    if (!hasChanges) {
      onClose();
      return;
    }
    setConfirmUpdateOpen(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      await onUpdate(task.task_id, {
        title       : formData.title.trim(),
        description : formData.description.trim(),
      });

      setConfirmUpdateOpen(false);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Handle Keyboard ──────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') handleClose();
  };

  if (!isOpen || !task) return null;

  return (
    <>
      
      {/* Main Modal */}
      <div className="overlay" onClick={handleClose} onKeyDown={handleKeyDown}>
        
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          
          <h2>Edit Task</h2>

          <input
            type="text"
            name="title"
            placeholder="Task title"
            value={formData.title}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Task description"
            value={formData.description}
            onChange={handleChange}
          />

          <div className="modal-actions">
            
            <button className="btn success" onClick={handleUpdateClick}>
              Update
            </button>

            <button className="btn secondary" onClick={handleClose}>
              Cancel
            </button>

          </div>

        </div>

      </div>

      {/* Close Confirmation */}
      <ConfirmModal
        isOpen={confirmCloseOpen}
        message="You have unsaved changes. Are you sure you want to cancel?"
        onClose={() => setConfirmCloseOpen(false)}
        onConfirm={handleConfirmClose}
      />

      {/* Update Confirmation */}
      <ConfirmModal
        isOpen={confirmUpdateOpen}
        message="Are you sure you want to update this task?"
        onClose={() => setConfirmUpdateOpen(false)}
        onConfirm={handleConfirmUpdate}
      />

    </>
  );
};

export default EditModal;