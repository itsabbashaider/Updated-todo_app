import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import {
  Formik,
  Form,
} from 'formik';

import TaskFormFields from '../tasks/task-form-field.component';
import ConfirmModal from './confirmation-modal.component';

import {
  createTaskSchema,
  updateTaskSchema,
} from '../../schemas/task.schema';
import { sanitizeTaskInput } from '../../utils/validation.util';

/**
 * Unified Task Modal - handles both Add & Edit modes
 * @param {boolean} isOpen - Modal visibility
 * @param {function} onClose - Close handler
 * @param {object} task - Task object (null/undefined = add mode, object = edit mode)
 * @param {function} onCreate - Handler for creating new task
 * @param {function} onUpdate - Handler for updating task
 * @param {string} error - Error message from parent
 */
function TaskModal({
  isOpen,
  onClose,
  task = null,
  onCreate,
  onUpdate,
  error = '',
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null); // 'close' or 'action'
  const [pendingValues, setPendingValues] = useState(null);
  const dirtyRef = useRef(false);

  const isEditMode = !!task;
  const modalTitle = isEditMode ? 'Edit Task' : 'Create Task';
  const actionButtonText = isEditMode ? 'Update' : 'Create';
  const actionButtonClass = isEditMode ? 'success' : 'primary';

  const handleClose = useCallback(
    (isDirty) => {
      if (isDirty) {
        setConfirmType('close');
        setConfirmOpen(true);
      } else {
        onClose();
      }
    },
    [onClose]
  );

  const handleConfirm = async () => {
    if (confirmType === 'close') {
      setConfirmOpen(false);
      onClose();
      return;
    }

    if (confirmType === 'action' && pendingValues) {
      try {
        if (isEditMode) {
          await onUpdate(task.task_id, pendingValues);
        } else {
          const cleanData = sanitizeTaskInput(pendingValues);
          await onCreate(cleanData);
        }
        setConfirmOpen(false);
        onClose();
      } catch (err) {
        console.error('Task action error:', err);
      }
    }
  };

  const handleFormSubmit = async (values, { setSubmitting }) => {
    try {
      // Edit mode: Check for changes
      if (isEditMode) {
        const hasChanges =
          values.title !== task.title ||
          values.description !== task.description ||
          values.priority !== task.priority;

        if (!hasChanges) {
          onClose();
          return;
        }

        // Ask for confirmation
        setPendingValues(values);
        setConfirmType('action');
        setConfirmOpen(true);
        return;
      }

      // Add mode: Create directly
      const cleanData = sanitizeTaskInput(values);
      await onCreate(cleanData);
      onClose();
    } catch (err) {
      console.error('Task action error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        handleClose(dirtyRef.current);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const confirmMessage =
    confirmType === 'close'
      ? 'You have unsaved changes. Are you sure you want to cancel?'
      : isEditMode
        ? 'Are you sure you want to update this task?'
        : '';

  return (
    <>
      <div className="overlay">
        <Formik
          initialValues={{
            title: task?.title || '',
            description: task?.description || '',
            priority: task?.priority || 'low',
          }}
          enableReinitialize={true}
          validationSchema={isEditMode ? updateTaskSchema : createTaskSchema}
          onSubmit={handleFormSubmit}
          validateOnChange={true}
          validateOnBlur={false}
        >
          {({ dirty, isSubmitting, isValid }) => {
            dirtyRef.current = dirty;

            return (
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>{modalTitle}</h2>

                {error && (
                  <div className="error-message-box" role="alert">
                    {error}
                  </div>
                )}

                <Form>
                  <TaskFormFields />

                  <div className="modal-actions">
                    <button
                      className={`btn ${actionButtonClass}`}
                      type="submit"
                      disabled={!isValid || isSubmitting}
                    >
                      {isSubmitting ? `${actionButtonText}ing...` : actionButtonText}
                    </button>

                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => handleClose(dirty)}
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              </div>
            );
          }}
        </Formik>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        message={confirmMessage}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

export default TaskModal;