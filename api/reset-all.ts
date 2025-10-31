import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, schema } from "../serverless/db";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const db = getDb();
    await db.delete(schema.votes);
    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to reset all" });
  }
}


