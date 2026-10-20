import express from "express";
import cors from "cors";
import helmet from "helmet";

import config from "@/config/config";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Team Task Manager API is running",
    environment: config.NODE_ENV,
  });
});

const server = app.listen(config.PORT, () => {
  console.log(`Server running at http://localhost:${config.PORT}`);
});

function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down server...`);

  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export default app;
