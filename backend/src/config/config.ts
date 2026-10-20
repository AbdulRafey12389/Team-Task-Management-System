import "dotenv/config";

function getEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

const config = {
  PORT: Number(process.env.PORT ?? 5000),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  DATABASE_URL: getEnv("DATABASE_URL"),
  SESSION_SECRET: getEnv("SESSION_SECRET"),
  CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:5173",
};

export default config;
