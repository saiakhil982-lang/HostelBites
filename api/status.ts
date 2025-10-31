import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, schema } from "../serverless/db";
import { eq, and } from "drizzle-orm";
import type { MealType } from "../shared/schema";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const db = getDb();
    const allNames = (await db.select().from(schema.names)).map((n) => n.name);

    const meals: MealType[] = ["Breakfast", "Lunch", "Dinner"];
    const result: any = { meals: {}, expectedCount: allNames.length };
    for (const meal of meals) {
      const eaten = (await db.select().from(schema.votes).where(eq(schema.votes.meal, meal))).map(v => v.name);
      const notEaten = allNames.filter(n => !eaten.includes(n));
      result.meals[meal] = {
        eaten,
        notEaten,
        eatenCount: eaten.length,
        notEatenCount: notEaten.length,
      };
    }
    res.status(200).json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to fetch status" });
  }
}


