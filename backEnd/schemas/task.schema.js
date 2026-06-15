// ─── Dependencies ─────────────────────────────────────────────────────────────
const Joi = require("joi");
const { create } = require("../controllers/task.controller");

// ─── Create ───────────────────────────────────────────────────────────────────
// ─── Create ───────────────────────────────────────────────────────────────────

const createTodoSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  description: Joi.string().optional(),
  completed: Joi.boolean().optional().default(false),
  priority: Joi.string()
    .valid("low", "medium", "high")
    .optional()
    .default("low"),
}).unknown(true);

// ─── Update ───────────────────────────────────────────────────────────────────
const updateTodoSchema = Joi.object({
  title: Joi.string().optional().min(3).max(100),
  description: Joi.string().optional(),
  completed: Joi.boolean().optional(),
  completed_at: Joi.date().allow(null).optional(),
  priority: Joi.string().valid("low", "medium", "high").optional(),
}).min(1);

// ─── Params ───────────────────────────────────────────────────────────────────
const todoIdParamSchema = Joi.object({
  task_id: Joi.string().uuid().required(), 
});

module.exports = { createTodoSchema, updateTodoSchema, todoIdParamSchema };
