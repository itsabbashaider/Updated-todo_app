import { Field, ErrorMessage } from 'formik';

/**
 * TaskFormFields - Reusable form fields for add/edit task modal
 * Eliminates duplication between add and edit modes
 */
function TaskFormFields() {
  return (
    <>
      {/* Title Field */}
      <Field
        type="text"
        name="title"
        placeholder="Enter task title..."
        maxLength="255"
      />
      <ErrorMessage
        name="title"
        component="div"
        className="error"
      />

      {/* Description Field */}
      <Field
        as="textarea"
        name="description"
        placeholder="Enter task description..."
        maxLength="5000"
      />
      <ErrorMessage
        name="description"
        component="div"
        className="error"
      />

      {/* Priority Field */}
      <Field as="select" name="priority">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </Field>
      <ErrorMessage
        name="priority"
        component="div"
        className="error"
      />
    </>
  );
}

export default TaskFormFields;