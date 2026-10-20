import { Prisma, TeamRole } from "../../generated/prisma/client";
import { prisma } from "@/config/prisma";

interface CreateTeamInput {
  name: string;
  description?: string | null;
}

interface UpdateTeamInput {
  name?: string;
  description?: string | null;
}

export async function createTeam(userId: string, input: CreateTeamInput) {
  return prisma.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        name: input.name,
        description: input.description || null,
        ownerId: userId,
      },
    });

    await tx.teamMember.create({
      data: {
        teamId: team.id,
        userId,
        role: TeamRole.OWNER,
      },
    });

    return team;
  });
}

export async function getUserTeams(userId: string) {
  return prisma.team.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          members: true,
          tasks: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getTeamById(userId: string, teamId: string) {
  return prisma.team.findFirst({
    where: {
      id: teamId,
      members: {
        some: { userId },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });
}

export async function updateTeam(
  userId: string,
  teamId: string,
  input: UpdateTeamInput,
) {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      ownerId: userId,
    },
  });

  if (!team) {
    return null;
  }

  return prisma.team.update({
    where: { id: teamId },
    data: input,
  });
}

export async function deleteTeam(userId: string, teamId: string) {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      ownerId: userId,
    },
  });

  if (!team) {
    return null;
  }

  return prisma.team.delete({
    where: { id: teamId },
  });
}

export async function addTeamMember(
  userId: string,
  teamId: string,
  email: string,
  role: TeamRole,
) {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      ownerId: userId,
    },
  });

  if (!team) {
    return { error: "TEAM_NOT_FOUND" as const };
  }

  const member = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!member) {
    return { error: "USER_NOT_FOUND" as const };
  }

  if (member.id === userId) {
    return { error: "ALREADY_OWNER" as const };
  }

  const existingMembership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId: member.id,
      },
    },
  });

  if (existingMembership) {
    return { error: "ALREADY_MEMBER" as const };
  }

  const membership = await prisma.teamMember.create({
    data: {
      teamId,
      userId: member.id,
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return { membership };
}

export async function removeTeamMember(
  userId: string,
  teamId: string,
  memberId: string,
) {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      ownerId: userId,
    },
  });

  if (!team) {
    return { error: "TEAM_NOT_FOUND" as const };
  }

  if (memberId === userId) {
    return { error: "CANNOT_REMOVE_OWNER" as const };
  }

  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId: memberId,
      },
    },
  });

  if (!membership) {
    return { error: "MEMBER_NOT_FOUND" as const };
  }

  await prisma.teamMember.delete({
    where: {
      teamId_userId: {
        teamId,
        userId: memberId,
      },
    },
  });

  return { success: true };
}
