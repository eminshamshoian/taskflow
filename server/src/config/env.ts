import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),

  APP_ENV: z.enum(["local", "test", "development", "staging", "production"]),

  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  WEB_ORIGIN: z.url(),

  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error", "silent"])
    .default("info"),

  DATABASE_URL: z.url(),

  JWT_SECRET: z.string().min(64),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  // Report the config fields, without printing secret value
  const fields = [
    ...new Set(result.error.issues.map((issue) => issue.path.join("."))),
  ];

  throw new Error(`Invalid env config: ${fields.join(", ")}`);
}

export const env = Object.freeze(result.data);
