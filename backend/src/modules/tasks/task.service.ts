import {
  Prisma,
  TaskPriority,
  TaskStatus,
} from "../../generated/prisma/client";

import { prisma } from "../../config/prisma";

interface CreateTaskInput {
  title: string;
  description?: string | null;
  teamId: string;
  assigneeId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  assigneeId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

interface TaskFilters {
  teamId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  page: number;
  limit: number;
}

export class TaskServiceError extends Error {
  constructor(
    public code:
      "TEAM_NOT_FOUND" | "TASK_NOT_FOUND" | "INVALID_ASSIGNEE" | "FORBIDDEN",
    message: string,
  ) {
    super(message);
    this.name = "TaskServiceError";
  }
}

async function ensureTeamMembership(userId: string, teamId: string) {
  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new TaskServiceError("TEAM_NOT_FOUND", "Team not found");
  }

  return membership;
}

async function ensureAssigneeBelongsToTeam(
  teamId: string,
  assigneeId: string | null | undefined,
) {
  if (assigneeId == null) {
    return;
  }

  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId: assigneeId,
      },
    },
  });

  if (!membership) {
    throw new TaskServiceError(
      "INVALID_ASSIGNEE",
      "Assignee must belong to the task's team",
    );
  }
}

export async function createTask(userId: string, input: CreateTaskInput) {
  await ensureTeamMembership(userId, input.teamId);

  await ensureAssigneeBelongsToTeam(input.teamId, input.assigneeId);

  return prisma.task.create({
    data: {
      title: input.title,
      description: input.description || null,
      teamId: input.teamId,
      assigneeId: input.assigneeId ?? null,
      createdById: userId,
      status: input.status ?? TaskStatus.TODO,
      priority: input.priority ?? TaskPriority.MEDIUM,
      dueDate: input.dueDate ?? null,
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getTasks(userId: string, filters: TaskFilters) {
  const { teamId, assigneeId, status, priority, search, page, limit } = filters;

  const where: Prisma.TaskWhereInput = {
    team: {
      members: {
        some: {
          userId,
        },
      },
    },

    ...(teamId ? { teamId } : {}),
    ...(assigneeId ? { assigneeId } : {}),
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),

    ...(search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    }),

    prisma.task.count({ where }),
  ]);

  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getTaskById(userId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      team: {
        members: {
          some: { userId },
        },
      },
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      activityLogs: {
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!task) {
    throw new TaskServiceError("TASK_NOT_FOUND", "Task not found");
  }

  return task;
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput,
) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      team: {
        members: {
          some: { userId },
        },
      },
    },
  });

  if (!task) {
    throw new TaskServiceError("TASK_NOT_FOUND", "Task not found");
  }

  const membership = await ensureTeamMembership(userId, task.teamId);

  const canManage =
    membership.role === "OWNER" ||
    membership.role === "ADMIN" ||
    task.createdById === userId;

  const isAssignee = task.assigneeId === userId;

  const assignmentChanged = input.assigneeId !== undefined;

  const privilegedFieldChanged =
    input.title !== undefined ||
    input.description !== undefined ||
    input.priority !== undefined ||
    input.dueDate !== undefined ||
    assignmentChanged;

  if (privilegedFieldChanged && !canManage) {
    throw new TaskServiceError(
      "FORBIDDEN",
      "You do not have permission to edit these task fields",
    );
  }

  if (input.status !== undefined && !canManage && !isAssignee) {
    throw new TaskServiceError(
      "FORBIDDEN",
      "Only the task creator, team administrators, or assignee can change task status",
    );
  }

  if (assignmentChanged) {
    await ensureAssigneeBelongsToTeam(task.teamId, input.assigneeId);
  }

  return prisma.$transaction(async (tx) => {
    const updatedTask = await tx.task.update({
      where: {
        id: taskId,
      },
      data: input,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await tx.activityLog.create({
      data: {
        taskId,
        userId,
        action: "TASK_UPDATED",
      },
    });

    return updatedTask;
  });
}

export async function deleteTask(userId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      team: {
        members: {
          some: { userId },
        },
      },
    },
  });

  if (!task) {
    throw new TaskServiceError("TASK_NOT_FOUND", "Task not found");
  }

  const membership = await ensureTeamMembership(userId, task.teamId);

  const canDelete =
    membership.role === "OWNER" ||
    membership.role === "ADMIN" ||
    task.createdById === userId;

  if (!canDelete) {
    throw new TaskServiceError("FORBIDDEN", "You cannot delete this task");
  }

  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

  return { success: true };
}
