import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import {
  Formik,
  Form,
  Field,
  ErrorMessage,
} from 'formik';

import ConfirmModal from './confirmation-modal.component';

import { createTaskSchema } from '../../schemas/task.schema';
import { sanitizeTaskInput } from '../../utils/validation.util';

function CreateModal({ isOpen, onClose, onCreate }) {

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isValid, setIsValid]         = useState(false);
  const dirtyRef = useRef(false);

  const handleClose = useCallback(
    (dirty) => {
      if (dirty) { setConfirmOpen(true); return; }
      onClose();
    },
    [onClose]
  );

  const handleConfirmClose = () => {
    setConfirmOpen(false);
    onClose();
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose(dirtyRef.current);
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="overlay">
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={{
          title:       '',
          description: '',
          priority:    'low',
        }}
        validationSchema={createTaskSchema}
        onSubmit={async (values, actions) => {
          const cleanData = sanitizeTaskInput(values);
          await onCreate(cleanData);
          actions.resetForm();
          onClose();
        }}
      >
        {({ dirty, values, isSubmitting }) => {

          dirtyRef.current = dirty;

          return (
            <>
              <ValidationEffect values={values} onValidChange={setIsValid} />

              <div className="modal">
                <h2>Create Task</h2>

                <Form>

                  <Field
                    type="text"
                    name="title"
                    placeholder="Enter task title..."
                    maxLength="255"
                  />
                  <ErrorMessage name="title" component="div" className="error" />

                  <Field
                    as="textarea"
                    name="description"
                    placeholder="Enter task description..."
                    maxLength="5000"
                  />
                  <ErrorMessage name="description" component="div" className="error" />

                  <Field as="select" name="priority">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Field>
                  <ErrorMessage name="priority" component="div" className="error" />

                  <div className="modal-actions">
                    <button
                      className="btn primary"
                      type="submit"
                      disabled={!isValid || isSubmitting}
                    >
                      {isSubmitting ? 'Creating...' : 'Create'}
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
            </>
          );
        }}
      </Formik>

      <ConfirmModal
        isOpen={confirmOpen}
        message="You have unsaved changes. Are you sure you want to cancel?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmClose}
      />
    </div>
  );
}

// ─── Validates values against schema on every change via useEffect ────────────
function ValidationEffect({ values, onValidChange }) {
  useEffect(() => {
    let cancelled = false;

    createTaskSchema.isValid(values).then((valid) => {
      if (!cancelled) onValidChange(valid);
    });

    return () => { cancelled = true; };
  }, [values, onValidChange]);

  return null;
}

export default CreateModal;