import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, schema } from "../serverless/db";
import { and, eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const db = getDb();
    const oldName = decodeURIComponent(req.query.oldName as string);

    if (req.method === "PUT") {
      const { newName } = (req.body || {}) as { newName?: string };
      if (!newName || typeof newName !== "string" || !newName.trim()) return res.status(400).json({ error: "New name is required" });
      // Update names
      await db.transaction(async (tx) => {
        await tx.delete(schema.names).where(eq(schema.names.name, oldName));
        await tx.insert(schema.names).values({ name: newName.trim() }).onConflictDoNothing();
        // Update votes
        const existing = await tx.select().from(schema.votes).where(eq(schema.votes.name, oldName));
        for (const v of existing) {
          await tx.delete(schema.votes).where(and(eq(schema.votes.name, v.name), eq(schema.votes.meal, v.meal)));
          await tx.insert(schema.votes).values({ name: newName.trim(), meal: v.meal }).onConflictDoNothing();
        }
      });
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === "DELETE") {
      await db.transaction(async (tx) => {
        await tx.delete(schema.votes).where(eq(schema.votes.name, oldName));
        await tx.delete(schema.names).where(eq(schema.names.name, oldName));
      });
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    res.status(400).json({ error: e.message || "Failed" });
  }
}


