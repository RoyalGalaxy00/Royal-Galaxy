import { MongoClient, ServerApiVersion, Db } from 'mongodb';

const uri = process.env.MONGODB_URI as string;

if (!uri) {
    throw new Error("Please add MONGODB_URI to environment variables");
}

console.log("Connecting with URI:", uri.replace(/:[^:]*@/, ':****@')); // Logs URI with hidden password

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
            console.log("Attempting to connect to MongoDB...");
            await client.connect();
            console.log("✅ Connected to MongoDB successfully");

            // Test the connection
            await client.db("admin").command({ ping: 1 });
            console.log("✅ MongoDB ping successful");

            db = client.db("Royal_Galaxy_Blog_Database");
        }
        return db;
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        throw error;
    }
}