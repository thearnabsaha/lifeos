import crypto from "crypto";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

const hash = (k: string) => crypto.createHash("sha256").update(k).digest("hex");

export async function createApiKey(userId: string, name: string) {
  const key = `los_${crypto.randomBytes(24).toString("base64url")}`;
  const db = await getDb();
  const row = { user_id: userId, name: name || "MCP key", prefix: key.slice(0, 10), hash: hash(key), created_at: new Date(), last_used_at: null, revoked_at: null };
  const r = await db.collection("api_keys").insertOne(row);
  return { id: r.insertedId.toString(), name: row.name, prefix: row.prefix, createdAt: row.created_at, key };
}

export async function listApiKeys(userId: string) {
  const db = await getDb();
  const rows = await db.collection("api_keys").find({ user_id: userId, revoked_at: null }).sort({ created_at: -1 }).toArray();
  return rows.map((r) => ({ id: r._id.toString(), name: r.name, prefix: r.prefix, createdAt: r.created_at, lastUsedAt: r.last_used_at }));
}

export async function revokeApiKey(userId: string, id: string) {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDb();
  const r = await db.collection("api_keys").updateOne({ _id: new ObjectId(id), user_id: userId }, { $set: { revoked_at: new Date() } });
  return r.modifiedCount > 0;
}

export async function verifyApiKey(key: string): Promise<string | null> {
  if (!key.startsWith("los_")) return null;
  const db = await getDb();
  const row = await db.collection("api_keys").findOneAndUpdate(
    { hash: hash(key), revoked_at: null },
    { $set: { last_used_at: new Date() } }
  );
  return row ? String(row.user_id) : null;
}
