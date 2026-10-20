import type { Request, Response, NextFunction } from "express";

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  TaskServiceError,
} from "./task.service";

function handleTaskError(error: unknown, res: Response, next: NextFunction) {
  if (error instanceof TaskServiceError) {
    const status =
      error.code === "FORBIDDEN"
        ? 403
        : error.code === "INVALID_ASSIGNEE"
          ? 400
          : 404;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }

  return next(error);
}

export async function createTaskController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const task = await createTask(req.user!.id, {
      ...req.body,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
    });

    return res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    return handleTaskError(error, res, next);
  }
}

export async function getTasksController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getTasks(
      req.user!.id,
      req.query as unknown as Parameters<typeof getTasks>[1],
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleTaskError(error, res, next);
  }
}

export async function getTaskController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const task = await getTaskById(req.user!.id, req.params.id as string);

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    return handleTaskError(error, res, next);
  }
}

export async function updateTaskController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const task = await updateTask(req.user!.id, req.params.id as string, {
      ...req.body,
      dueDate:
        req.body.dueDate === undefined
          ? undefined
          : req.body.dueDate === null
            ? null
            : new Date(req.body.dueDate),
    });

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    return handleTaskError(error, res, next);
  }
}

export async function deleteTaskController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await deleteTask(req.user!.id, req.params.id as string);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    return handleTaskError(error, res, next);
  }
}
