import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../serverless/schema";

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const client = neon(url);
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof getDb>;
export { schema };


