import { Router } from "express";
import Joi from "joi";

import { requireAuth } from "@/middlewares/isAuth";

import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from "./task.validation.js";

import {
  createTaskController,
  getTasksController,
  getTaskController,
  updateTaskController,
  deleteTaskController,
} from "./task.controller.js";

const router = Router();

function validate(schema: Joi.ObjectSchema, source: "body" | "query" = "body") {
  return (
    req: import("express").Request,
    res: import("express").Response,
    next: import("express").NextFunction,
  ) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });
    }

    if (source === "body") {
      req.body = value;
    } else {
      res.locals.validatedQuery = value;
    }

    next();
  };
}

router.use(requireAuth);

router.post("/", validate(createTaskSchema), createTaskController);

router.get(
  "/",
  validate(taskQuerySchema, "query"),
  (req, res, next) => {
    req.query = res.locals.validatedQuery;
    next();
  },
  getTasksController,
);

router.get("/:id", getTaskController);

router.patch("/:id", validate(updateTaskSchema), updateTaskController);

router.delete("/:id", deleteTaskController);

export default router;
