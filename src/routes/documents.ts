import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db/index.js";
import { documents, type Document } from "../db/schema.js";
import { notFound } from "../middleware/error.js";
import {
  createDocumentBodySchema,
  documentIdParamSchema,
  listDocumentsQuerySchema,
} from "../schemas/documents.js";

function toApiDocument(row: Document) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    source_url: row.sourceUrl,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export const documentsRoutes = new Hono();

documentsRoutes.post("/", async (c) => {
  const body = createDocumentBodySchema.parse(await c.req.json());

  const [created] = await db
    .insert(documents)
    .values({
      title: body.title,
      content: body.content,
      sourceUrl: body.source_url ?? null,
    })
    .returning();

  return c.json(toApiDocument(created), 201);
});

documentsRoutes.get("/", async (c) => {
  const query = listDocumentsQuerySchema.parse({
    limit: c.req.query("limit"),
    offset: c.req.query("offset"),
  });

  // Newest first — documented in README.
  const rows = await db
    .select()
    .from(documents)
    .orderBy(desc(documents.createdAt))
    .limit(query.limit)
    .offset(query.offset);

  return c.json({
    items: rows.map(toApiDocument),
    limit: query.limit,
    offset: query.offset,
  });
});

documentsRoutes.get("/:id", async (c) => {
  const { id } = documentIdParamSchema.parse({ id: c.req.param("id") });

  const [row] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  if (!row) {
    throw notFound(`Document ${id} not found`);
  }

  return c.json(toApiDocument(row));
});
