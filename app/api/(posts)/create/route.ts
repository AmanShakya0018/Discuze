import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const postSchema = z.object({
  userId: z.string().uuid("Invalid userId"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(799, "Content must not exceed 799 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, content } = postSchema.parse(body);

    const post = await prisma.post.create({
      data: {
        content,
        user: {
          connect: { id: userId },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Failed to add post" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Post added successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal Server Error: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
