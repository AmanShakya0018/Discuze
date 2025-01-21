import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const postUpdateSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(799, "Content must not exceed 799 characters"),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { content } = await req.json();

  if (!id) {
    return NextResponse.json(
      { success: false, message: "ID is missing in the request params" },
      { status: 400 }
    );
  }

  const validationResult = postUpdateSchema.safeParse({ content });

  if (!validationResult.success) {
    return NextResponse.json(
      { success: false, message: validationResult.error.errors[0].message },
      { status: 400 }
    );
  }

  try {
    const updatedPost = await prisma.post.update({
      where: { id },
      data: { content: validationResult.data.content },
    });

    return NextResponse.json(
      { success: true, message: "Post updated successfully", post: updatedPost },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
