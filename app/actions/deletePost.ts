import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/RGconn";
import { ObjectId } from "mongodb";

export async function deletePost(request: NextRequest) {
    try {
        const { id, collection } = await request.json();
        // Validate inputs
        if (!id || !collection) {
            return NextResponse.json(
                { success: false, message: "Missing required parameters" },
                { status: 400 }
            );
        }

        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid ID format" },
                { status: 400 }
            );
        }

        // Connect to database
        const db = await connectDB();

        // Delete document
        const result = await db.collection(collection).deleteOne({
            _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { success: false, message: "Document not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Document deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Delete error:", error);

        const errorMessage = error instanceof Error
            ? `Server error: ${error.message}`
            : "An unexpected error occurred";

        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
}