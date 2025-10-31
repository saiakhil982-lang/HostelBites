import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, schema } from "../serverless/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const db = getDb();
    if (req.method === "POST") {
      const { name } = (req.body || {}) as { name?: string };
      if (!name || typeof name !== "string" || !name.trim()) return res.status(400).json({ error: "Name is required" });
      await db.insert(schema.names).values({ name: name.trim() }).onConflictDoNothing();
      res.status(200).json({ ok: true });
      return;
    }
    res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    res.status(400).json({ error: e.message || "Failed" });
  }
}


