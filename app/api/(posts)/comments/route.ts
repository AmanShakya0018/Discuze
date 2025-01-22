import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { postId, content, userId } = await req.json();

    if (!postId || !content || !userId) {
      return NextResponse.json(
        { success: false, message: "Invalid data provided" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        user: {
          connect: { id: userId },
        },
        post: {
          connect: { id: postId },
        },
      },
    });

    return NextResponse.json(
      { success: true, message: "Comment added successfully", comment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
