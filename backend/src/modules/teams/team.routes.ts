import { Router } from "express";

import { requireAuth } from "@/middlewares/isAuth";

import {
  createTeamSchema,
  updateTeamSchema,
  addMemberSchema,
} from "./team.validation";

import {
  createTeamController,
  getTeamsController,
  getTeamController,
  updateTeamController,
  deleteTeamController,
  addMemberController,
  removeMemberController,
} from "./team.controller";

import Joi from "joi";

const router = Router();

function validateBody(schema: Joi.ObjectSchema) {
  return (
    req: import("express").Request,
    res: import("express").Response,
    next: import("express").NextFunction,
  ) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });
    }

    req.body = value;
    next();
  };
}

router.use(requireAuth);

router.post("/", validateBody(createTeamSchema), createTeamController);
router.get("/", getTeamsController);
router.get("/:id", getTeamController);

router.patch("/:id", validateBody(updateTeamSchema), updateTeamController);

router.delete("/:id", deleteTeamController);

router.post("/:id/members", validateBody(addMemberSchema), addMemberController);

router.delete("/:id/members/:userId", removeMemberController);

export default router;
