// ─── Dependencies ─────────────────────────────────────────────────────────────
const Joi = require('joi');

// ─── Create ───────────────────────────────────────────────────────────────────
const createTodoSchema = Joi.object({
  title      : Joi.string().required().min(3).max(100),
  description: Joi.string().optional().allow(null, ''),
  completed  : Joi.boolean().optional().default(false),
});

// ─── Update ───────────────────────────────────────────────────────────────────
const updateTodoSchema = Joi.object({
  title       : Joi.string().optional().min(3).max(100),
  description : Joi.string().optional().allow(null, ''),
  completed   : Joi.boolean().optional(),
  completed_at: Joi.date().allow(null).optional(),
}).min(1);

// ─── Params ───────────────────────────────────────────────────────────────────
const todoIdParamSchema = Joi.object({
  task_id: Joi.number().integer().required(),
});

module.exports = { createTodoSchema, updateTodoSchema, todoIdParamSchema };