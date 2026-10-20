import Joi from "joi";

export const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(2).max(150).required(),

  description: Joi.string().trim().max(3000).allow("", null),

  teamId: Joi.string().uuid().required(),

  assigneeId: Joi.string().uuid().allow(null),

  status: Joi.string()
    .valid("TODO", "IN_PROGRESS", "COMPLETED")
    .default("TODO"),

  priority: Joi.string()
    .valid("LOW", "MEDIUM", "HIGH", "URGENT")
    .default("MEDIUM"),

  dueDate: Joi.date().iso().allow(null),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(2).max(150),

  description: Joi.string().trim().max(3000).allow("", null),

  assigneeId: Joi.string().uuid().allow(null),

  status: Joi.string().valid("TODO", "IN_PROGRESS", "COMPLETED"),

  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "URGENT"),

  dueDate: Joi.date().iso().allow(null),
}).min(1);

export const taskQuerySchema = Joi.object({
  teamId: Joi.string().uuid(),

  assigneeId: Joi.string().uuid(),

  status: Joi.string().valid("TODO", "IN_PROGRESS", "COMPLETED"),

  priority: Joi.string().valid("LOW", "MEDIUM", "HIGH", "URGENT"),

  search: Joi.string().trim().max(100),

  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(100).default(10),
});
