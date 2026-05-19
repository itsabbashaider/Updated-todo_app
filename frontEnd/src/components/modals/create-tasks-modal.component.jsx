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

import {
  createTaskSchema,
} from '../../schemas/task.schema';

// ─── Create Modal Component ─────────────────────────────────────────────────

function CreateModal({
  isOpen,
  onClose,
  onCreate,
}) {

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const dirtyRef =
    useRef(false);

  // ─── HANDLE CLOSE ─────────────────────────────────────────────────────────

  const handleClose = useCallback(
    (dirty) => {

      if (dirty) {

        setConfirmOpen(true);

        return;

      }

      onClose();

    },
    [onClose]
  );

  const handleConfirmClose = () => {

    setConfirmOpen(false);

    onClose();

  };

  // ─── ESCAPE KEY ───────────────────────────────────────────────────────────

  useEffect(() => {

    const handleEsc = (e) => {

      if (e.key === 'Escape') {
        handleClose(dirtyRef.current);
      }

    };

    if (isOpen) {

      window.addEventListener(
        'keydown',
        handleEsc
      );

    }

    return () => {

      window.removeEventListener(
        'keydown',
        handleEsc
      );

    };

  }, [isOpen, handleClose]);

  // ─── HIDE ─────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  // ─── UI ───────────────────────────────────────────────────────────────────

  return (

    <div className="overlay">

      <Formik

        initialValues={{
          title       : '',
          description : '',
          priority    : 'low',
        }}

        validationSchema={
          createTaskSchema
        }

        onSubmit={async (
          values,
          actions
        ) => {

          await onCreate(values);

          actions.resetForm();

          onClose();

        }}

      >

        {({ dirty }) => {

          dirtyRef.current = dirty;

          return (

            <div
              className="modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <h2>
                Create Task
              </h2>

              <Form>

                {/* TITLE */}

                <Field
                  type="text"
                  name="title"
                  placeholder="Enter task title..."
                />

                <ErrorMessage
                  name="title"
                  component="div"
                  className="error"
                />

                {/* DESCRIPTION */}

                <Field
                  as="textarea"
                  name="description"
                  placeholder="Enter task description..."
                />

                <ErrorMessage
                  name="description"
                  component="div"
                  className="error"
                />

                {/* PRIORITY */}

                <Field
                  as="select"
                  name="priority"
                >

                  <option value="low">
                    Low
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="high">
                    High
                  </option>

                </Field>

                <ErrorMessage
                  name="priority"
                  component="div"
                  className="error"
                />

                {/* BUTTONS */}

                <div className="modal-actions">

                  <button
                    className="btn primary"
                    type="submit"
                  >
                    Create
                  </button>

                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() =>
                      handleClose(dirty)
                    }
                  >
                    Cancel
                  </button>

                </div>

              </Form>

            </div>

          );

        }}

      </Formik>

      {/* CONFIRM MODAL */}

      <ConfirmModal
        isOpen={confirmOpen}
        message="You have unsaved changes. Are you sure you want to cancel?"
        onClose={() =>
          setConfirmOpen(false)
        }
        onConfirm={handleConfirmClose}
      />

    </div>

  );

}

export default CreateModal;