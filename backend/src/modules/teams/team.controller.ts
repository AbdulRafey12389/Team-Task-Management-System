import type { Request, Response, NextFunction } from "express";

import {
  createTeam,
  getUserTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
} from "./team.service";

export async function createTeamController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const team = await createTeam(req.user!.id, req.body);

    return res.status(201).json({
      success: true,
      message: "Team created successfully",
      team,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTeamsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const teams = await getUserTeams(req.user!.id);

    return res.status(200).json({
      success: true,
      teams,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTeamController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const team = await getTeamById(req.user!.id, req.params.id as string);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    return res.status(200).json({
      success: true,
      team,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTeamController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const team = await updateTeam(
      req.user!.id,
      req.params.id as string,
      req.body,
    );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found or permission denied",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Team updated successfully",
      team,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTeamController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const team = await deleteTeam(req.user!.id, req.params.id as string);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found or permission denied",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function addMemberController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await addTeamMember(
      req.user!.id,
      req.params.id as string,
      req.body.email,
      req.body.role,
    );

    if ("error" in result) {
      const status =
        result.error === "USER_NOT_FOUND"
          ? 404
          : result.error === "ALREADY_MEMBER" ||
              result.error === "ALREADY_OWNER"
            ? 409
            : 404;

      return res.status(status).json({
        success: false,
        message: result.error,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      membership: result.membership,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeMemberController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await removeTeamMember(
      req.user!.id,
      req.params.id as string,
      req.params.userId as string,
    );

    if ("error" in result) {
      return res.status(result.error === "MEMBER_NOT_FOUND" ? 404 : 403).json({
        success: false,
        message: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    next(error);
  }
}
