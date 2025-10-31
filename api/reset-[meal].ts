import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, schema } from "../serverless/db";
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const meal = req.query.meal as string;
    if (!["Breakfast", "Lunch", "Dinner"].includes(meal)) return res.status(400).json({ error: "Invalid meal" });
    const db = getDb();
    await db.delete(schema.votes).where(eq(schema.votes.meal, meal));
    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to reset meal" });
  }
}


