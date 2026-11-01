import express, { Request, Response } from "express";
import cors from "cors";
import { env } from "./config/env.js";

const app = express();

app.set("env", env.NODE_ENV);

app.use(
  cors({
    origin: env.WEB_ORIGIN,
  }),
);

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Base health check route
app.get("/health", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ message: `TS node.js server is running on port ${env.PORT}` });
});

// Start listening for traffic
app.listen(env.PORT, () => {
  console.log(
    `[server]: Server is running on port ${env.PORT} (${env.APP_ENV})`,
  );
});
