import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import config from "@/config/config";
import { prisma } from "@/config/prisma";
import { Server } from "node:http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "./modules/auth/passport";
import authRoutes from "./modules/auth/auth.routes";
import teamRoutes from "./modules/teams/team.routes";
import taskRoutes from "./modules/tasks/task.routes";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

app.use(morgan("dev"));

app.use(
  cors({
    origin: "http://localhost:5000",
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

const PgSession = connectPgSimple(session);

app.use(
  session({
    name: "ttm.sid",
    store: new PgSession({
      conString: config.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/tasks", taskRoutes);

let server: Server;

async function startServer() {
  try {
    await prisma.$connect();

    console.log("PostgreSQL connected successfully");

    server = app.listen(config.PORT, () => {
      console.log(`Server running at http://localhost:${config.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();

async function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down server...`);

  if (server) {
    server.close(async (error) => {
      if (error) {
        console.error("HTTP server close failed:", error);
        process.exitCode = 1;
      }

      try {
        await prisma.$disconnect();
        console.log("PostgreSQL disconnected.");
      } catch (disconnectError) {
        console.error("Database disconnect failed:", disconnectError);
        process.exitCode = 1;
      }
    });
  } else {
    await prisma.$disconnect();
  }
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
