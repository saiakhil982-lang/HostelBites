import { pgTable, text, primaryKey } from "drizzle-orm/pg-core";

export const names = pgTable("names", {
  name: text("name").primaryKey(),
});

export const votes = pgTable("votes", {
  name: text("name").notNull(),
  meal: text("meal").notNull(), // Breakfast | Lunch | Dinner
}, (t) => ({
  pk: primaryKey({ columns: [t.name, t.meal] }),
}));


