import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Design: UUID PKs via gen_random_uuid() so document IDs stay unique across
 * services / imports later, without relying on the application to mint IDs.
 */
export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sourceUrl: text("source_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
