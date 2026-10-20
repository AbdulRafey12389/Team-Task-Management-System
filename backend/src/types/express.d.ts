import "express";
import "express-session";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name?: string;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    passport?: {
      user: string;
    };
  }
}

export {};
