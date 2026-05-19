// ─── Dependencies ─────────────────────────────────────────────────────────────
const express        = require('express');
const router         = express.Router();
const taskController = require('../controllers/task.controller');

// ─── Middlewares ──────────────────────────────────────────────────────────────
const asyncHandler    = require('../middlewares/async-handler.middleware');
const validateRequest = require('../middlewares/validate-request.middleware');

// ─── Schemas ──────────────────────────────────────────────────────────────────
const {
  createTodoSchema,
  updateTodoSchema,
  todoIdParamSchema,
} = require('../schemas/task.schema');

// ─── Collection Routes ────────────────────────────────────────────────────────
router.get('/',
  asyncHandler(taskController.getAll)
);

router.post('/',
  validateRequest(createTodoSchema),
  asyncHandler(taskController.create)
);

// ─── Single Resource Routes ───────────────────────────────────────────────────
router
  .route('/:task_id')
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