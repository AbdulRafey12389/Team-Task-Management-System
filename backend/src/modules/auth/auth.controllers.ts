import type { Request, Response, NextFunction } from "express";
import { registerUser } from "./auth.service";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user,
    });
  } catch (error) {
    next(error);
  }
}

export function loginSuccess(req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    message: "Login successful",
    user: req.user,
  });
}

export function logout(req: Request, res: Response, next: NextFunction) {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      res.clearCookie("ttm.sid", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    });
  });
}

export function getCurrentUser(req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
}
