import { Router } from "express";

import {
  register,
  loginSuccess,
  logout,
  getCurrentUser,
} from "./auth.controllers";

import { registerSchema, loginSchema } from "./auth.validation";
import { requireAuth } from "@/middlewares/isAuth";

import passport from "./passport";

const router = Router();

function validateBody(schema: typeof registerSchema) {
  return (req: any, res: any, next: any) => {
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

router.post("/register", validateBody(registerSchema), register);

router.post(
  "/login",
  validateBody(loginSchema),
  passport.authenticate("local"),
  loginSuccess,
);

router.post("/logout", requireAuth, logout);

router.get("/me", requireAuth, getCurrentUser);

export default router;
