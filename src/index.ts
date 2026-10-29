import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { loadEnv } from "./env.js";
import { errorHandler } from "./middleware/error.js";
import { documentsRoutes } from "./routes/documents.js";

const env = loadEnv();

const app = new Hono();

app.onError(errorHandler);

app.route("/documents", documentsRoutes);

serve({
  fetch: app.fetch,
  port: env.PORT,
});

console.log(`Listening on http://localhost:${env.PORT}`);
