import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, schema } from "../serverless/db";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const db = getDb();
    const rows = await db.select().from(schema.names);
    res.status(200).json(rows.map(r => r.name));
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to load names" });
  }
}


