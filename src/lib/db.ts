import { MongoClient, Db, ObjectId } from "mongodb";

export function getMongoUri(): string {
  return (
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    process.env.MONGODB_URL ||
    "mongodb://127.0.0.1:27017/lifeos"
  ).trim();
}

export function getDatabaseName(uri: string): string {
  if (process.env.MONGODB_DB) return process.env.MONGODB_DB.trim();
  if (uri) {
    try {
      const parsed = new URL(
        uri.replace("mongodb+srv://", "http://").replace("mongodb://", "http://")
      );
      const pathDb = parsed.pathname.replace(/^\//, "").split("?")[0];
      if (pathDb) return pathDb;
    } catch {
      // ignore
    }
  }
  return "lifeos";
}

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let cachedClient: MongoClient | null = null;
let cachedPromise: Promise<MongoClient> | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const uri = getMongoUri();
  const dbName = getDatabaseName(uri);

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    const client = await global._mongoClientPromise;
    return { client, db: client.db(dbName) };
  }

  if (!cachedPromise) {
    const client = new MongoClient(uri, options);
    cachedPromise = client.connect();
  }

  const client = await cachedPromise;
  return { client, db: client.db(dbName) };
}

export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

export function toObjectId(id: string): ObjectId | string {
  try {
    if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
      return new ObjectId(id);
    }
  } catch {
    // fallback
  }
  return id;
}

export function formatDoc<T extends Record<string, any>>(doc: T | null | undefined): any {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return {
    id: _id ? _id.toString() : doc.id || "",
    ...rest,
  };
}

export async function ensureIndexes() {
  const db = await getDb();

  // users
  await db.collection("users").createIndex({ email: 1 }, { unique: true });

  // time_entries
  await db
    .collection("time_entries")
    .createIndex({ user_id: 1, date: 1, hour: 1 }, { unique: true });
  await db
    .collection("time_entries")
    .createIndex({ user_id: 1, date: 1 });

  // journal_entries
  await db
    .collection("journal_entries")
    .createIndex({ user_id: 1, date: 1 }, { unique: true });

  // todos
  await db
    .collection("todos")
    .createIndex({ user_id: 1, completed: 1, schedule: 1, due_date: 1 });

  // reminders
  await db
    .collection("reminders")
    .createIndex({ user_id: 1, completed: 1, due_date: 1 });

  // notes
  await db
    .collection("notes")
    .createIndex({ user_id: 1, updated_at: -1 });

  // attachments
  await db
    .collection("attachments")
    .createIndex({ user_id: 1, parent_type: 1, parent_id: 1 });
}

// Backward compatibility alias for setup route
export const ensureTables = ensureIndexes;
