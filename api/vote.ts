import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, schema } from "../serverless/db";
import { voteSchema } from "../shared/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const parsed = voteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid vote data" });
    const { name, meal } = parsed.data;

    const db = getDb();
    // Ensure name exists
    await db.insert(schema.names).values({ name }).onConflictDoNothing();
    // Insert vote if not exists
    await db.insert(schema.votes).values({ name, meal }).onConflictDoNothing();
    // Return updated status via status handler behavior
    // Reuse logic: simple redirect not possible; compute eatenCount quick path
    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message || "Failed to vote" });
  }
}


