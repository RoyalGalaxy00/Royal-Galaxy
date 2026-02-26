import { MongoClient, ServerApiVersion, Db } from 'mongodb';

const uri = process.env.MONGODB_URI as string;

if (!uri) {
    throw new Error("Please add MONGODB_URI to environment variables");
}

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db: Db | null = null;

export async function connectDB() {
    try {
        if (!db) {
            await client.connect();
            db = client.db("Royal_Galaxy_Blog_Database");
            await db.command({ ping: 1 });

        }
        return db;
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
}