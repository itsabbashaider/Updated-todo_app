import { useState, useEffect, useCallback } from 'react';
import ConfirmModal from './confirmation-modal.component';

// ─── Create Modal Component ───────────────────────────────────────────────────
function CreateModal({ isOpen, onClose, onCreate }) {
  
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ─── Reset Form ───────────────────────────────────────────────────────────
  const resetForm = () => {
    setTitle('');
    setDescription('');
  };

  // ─── Handle Close ─────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    const hasChanges = title.trim() || description.trim();

    if (hasChanges) {
      setConfirmOpen(true);
      return;
    }

    resetForm();
    onClose();
  }, [title, description, onClose]);

  const handleConfirmClose = () => {
    setConfirmOpen(false);
    resetForm();
    onClose();
  };

  // ─── Handle Submit ────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();

    const titleMissing = !title.trim();
    const descMissing  = !description.trim();

    if (titleMissing || descMissing) {
      alert(
        titleMissing && descMissing
          ? 'Title and Description are required'
          : titleMissing
            ? 'Title is required'
            : 'Description is required'
      );
      return;
    }

    onCreate({ title, description });
    resetForm();
  };

  // ─── Escape Key Listener ──────────────────────────────────────────────────
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={handleClose}>
      
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        
        <h2>Create Task</h2>

        <form onSubmit={handleSubmit}>
          
          <input
            type="text"
            placeholder="Enter task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Enter task description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="modal-actions">
            
            <button className="btn primary" type="submit">
              Create
            </button>

            <button className="btn secondary" type="button" onClick={handleClose}>
              Cancel
            </button>

          </div>

        </form>

      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        message="You have unsaved changes. Are you sure you want to cancel?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmClose}
      />

    </div>
  );
}

export default CreateModal;