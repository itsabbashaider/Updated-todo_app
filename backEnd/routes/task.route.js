const express        = require('express');
const router         = express.Router();
const taskController = require('../controllers/task.controller');

const authenticate    = require('../middlewares/auth.middleware');
const validateRequest = require('../middlewares/validate-request.middleware');

const {
  createTodoSchema,
  updateTodoSchema,
  todoIdParamSchema,
} = require('../schemas/task.schema');

// ─── Collection Routes ────────────────────────────────────────────────────────

router.get('/',
  authenticate,
  taskController.getAll
);

router.post('/',
  authenticate,
  validateRequest(createTodoSchema),
  taskController.create
);

// ─── Single Resource Routes ───────────────────────────────────────────────────

router
  .route('/:task_id')
  .get(
    authenticate,
    validateRequest(todoIdParamSchema, 'params'),
    taskController.getOne
  )
  .put(
    authenticate,
    validateRequest(todoIdParamSchema, 'params'),
    validateRequest(updateTodoSchema),
    taskController.update
  )
  .delete(
    authenticate,
    validateRequest(todoIdParamSchema, 'params'),
    taskController.remove
  );

module.exports = router;