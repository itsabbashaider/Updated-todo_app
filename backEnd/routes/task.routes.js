const express = require('express');
const router = express.Router();

const taskController = require('../controllers/task.controller');
const validateRequest = require('../middlewares/validate-request.middleware');
const asyncHandler = require('../middlewares/async-handler.middleware');

const {
  createTodoSchema,
  updateTodoSchema,
  todoIdParamSchema,
} = require('../schemas/task.schema');

router.get('/', asyncHandler(taskController.getAll));

router.post(
  '/',
  validateRequest(createTodoSchema),
  asyncHandler(taskController.create)
);

router
  .route('/:id')
  .get(
    validateRequest(todoIdParamSchema, 'params'),
    asyncHandler(taskController.getOne)
  )
  .put(
    validateRequest(todoIdParamSchema, 'params'),
    validateRequest(updateTodoSchema),
    asyncHandler(taskController.update)
  )
  .delete(
    validateRequest(todoIdParamSchema, 'params'),
    asyncHandler(taskController.remove)
  );

module.exports = router;