import { db } from "@/app/parts/firebase";
import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Simple auth helper
function getAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

// Validation schemas
const createPostSchema = z.object({
  text: z.string().min(1).max(500),
  imageUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Basic auth check
    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate input
    const body = await req.json();
    const { text, imageUrl } = createPostSchema.parse(body);

    // 3. Create post (simplified)
    const postData = {
      text,
      imageUrl: imageUrl || null,
      userId: "authenticated-user", // Simplified
      userName: "User",
      userPhoto: null,
      createdAt: serverTimestamp(),
      likes: [],
    };

    // 4. Database operation
    const docRef = await addDoc(collection(db, "posts"), postData);

    return NextResponse.json({ 
      success: true, 
      postId: docRef.id 
    });

  } catch (error) {
    console.error("Post creation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors }, 
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // 1. Basic auth check
    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("id");

    if (!postId) {
      return NextResponse.json({ error: "Post ID required" }, { status: 400 });
    }

    // Verify post exists
    const postDocRef = doc(db, "posts", postId);
    const postDoc = await getDoc(postDocRef);
    
    if (!postDoc.exists()) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Delete post (simplified)
    await deleteDoc(postDocRef);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Post deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
