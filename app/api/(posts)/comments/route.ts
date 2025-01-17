import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { postId, content } = await req.json();

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        post: {
          connect: { id: postId },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, message: "Failed to add comment" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Comment added successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server error: " + error },
      { status: 500 }
    );
  }
}
