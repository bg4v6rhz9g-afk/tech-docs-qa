import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Prefer DATABASE_URL; fall back so `pnpm db:generate` works without a live DB.
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/tech_docs_qa",
  },
});
