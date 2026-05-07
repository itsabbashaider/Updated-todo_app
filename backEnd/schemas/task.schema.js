const Joi = require("joi");

const createTodoSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  description: Joi.string().optional().allow(null, ""),
  completed: Joi.boolean().optional().default(false),
});

const updateTodoSchema = Joi.object({
  title: Joi.string().optional().min(3).max(100),
  description: Joi.string().optional().allow(null, ""),
  completed: Joi.boolean().optional(),
  completedAt: Joi.date().allow(null).optional(),
}).min(1);



const todoIdParamSchema = Joi.object({
  id: Joi.number().integer().required(),
});

module.exports = {
  createTodoSchema,
  updateTodoSchema,
  todoIdParamSchema,
};
