import Joi from "joi";

export const createTeamSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),

  description: Joi.string().trim().max(500).allow("", null),
});

export const updateTeamSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),

  description: Joi.string().trim().max(500).allow("", null),
}).min(1);

export const addMemberSchema = Joi.object({
  email: Joi.string().trim().email().max(254).required(),

  role: Joi.string().valid("ADMIN", "MEMBER").default("MEMBER"),
});
