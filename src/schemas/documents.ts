import { z } from "zod";

export const createDocumentBodySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  // Strict URL when present; null or omitted is allowed.
  source_url: z.string().url().nullable().optional(),
});

export const documentIdParamSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Design: limit/offset pagination — default limit=20, max 100; offset >= 0.
 * Response shape is { items, limit, offset } (no total count query).
 */
export const listDocumentsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .default("20")
    .transform(Number)
    .pipe(z.number().int().min(1).max(100)),
  offset: z
    .string()
    .optional()
    .default("0")
    .transform(Number)
    .pipe(z.number().int().min(0)),
});

export type CreateDocumentBody = z.infer<typeof createDocumentBodySchema>;
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
