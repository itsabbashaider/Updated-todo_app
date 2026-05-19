// ─── src/components/modals/edit-tasks-modal.component.jsx ──────────────────

import {
  useState,
  useCallback,
} from 'react';

import {
  Formik,
  Form,
  Field,
  ErrorMessage,
} from 'formik';

import ConfirmModal from './confirmation-modal.component';

import {
  updateTaskSchema,
} from '../../schemas/task.schema';


// ─── Edit Modal Component ───────────────────────────────────────────────────

const EditModal = ({
  isOpen,
  onClose,
  task,
  onUpdate,
}) => {

  const [
    confirmCloseOpen,
    setConfirmCloseOpen,
  ] = useState(false);

  const [
    confirmUpdateOpen,
    setConfirmUpdateOpen,
  ] = useState(false);

  const [
    pendingValues,
    setPendingValues,
  ] = useState(null);

  // ─── Handle Close ─────────────────────────────────────────────────────────

  const handleClose =
    useCallback(
      (dirty) => {

        if (dirty) {
          setConfirmCloseOpen(true);
          return;
        }

        onClose();

      },
      [onClose]
    );

  const handleConfirmClose =
    () => {

      setConfirmCloseOpen(false);

      onClose();

    };

  // ─── Handle Confirm Update ───────────────────────────────────────────────

  const handleConfirmUpdate =
    async () => {

      try {

        await onUpdate(
          task.task_id,
          pendingValues
        );

        setConfirmUpdateOpen(false);

        onClose();

      } catch (err) {

        console.error(err);

      }

    };

  if (!isOpen || !task)
    return null;

  return (

    <>

      <div className="overlay">

        <Formik

          initialValues={{
            title:
              task?.title || '',

            description:
              task?.description || '',

            priority:
              task?.priority || 'low',
          }}

          enableReinitialize

          validationSchema={
            updateTaskSchema
          }

          onSubmit={(values) => {

            const hasChanges =
              values.title !== task.title ||
              values.description !== task.description ||
              values.priority !== task.priority;

            if (!hasChanges) {
              onClose();
              return;
            }

            setPendingValues(values);

            setConfirmUpdateOpen(true);

          }}

        >

          {({ dirty, submitForm }) => (

            <div
              className="modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <h2>
                Edit Task
              </h2>

              <Form>

                {/* Title */}

                <Field
                  type="text"
                  name="title"
                  placeholder="Task title"
                />

                <ErrorMessage
                  name="title"
                  component="div"
                  className="error"
                />

                {/* Description */}

                <Field
                  as="textarea"
                  name="description"
                  placeholder="Task description"
                />

                <ErrorMessage
                  name="description"
                  component="div"
                  className="error"
                />

                {/* Priority */}

                <Field
                  as="select"
                  name="priority"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Field>

                <ErrorMessage
                  name="priority"
                  component="div"
                  className="error"
                />

                {/* Buttons */}

                <div className="modal-actions">

                  <button
                    className="btn success"
                    type="button"
                    onClick={() => {
                      if (!dirty) {
                        onClose();
                        return;
                      }
                      submitForm();
                    }}
                  >
                    Update
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

          )}

        </Formik>

      </div>

      {/* Close Confirmation */}

      <ConfirmModal
        isOpen={confirmCloseOpen}
        message="You have unsaved changes. Are you sure you want to cancel?"
        onClose={() =>
          setConfirmCloseOpen(false)
        }
        onConfirm={
          handleConfirmClose
        }
      />

      {/* Update Confirmation */}

      <ConfirmModal
        isOpen={confirmUpdateOpen}
        message="Are you sure you want to update this task?"
        onClose={() =>
          setConfirmUpdateOpen(false)
        }
        onConfirm={
          handleConfirmUpdate
        }
      />

    </>

  );

};

export default EditModal;