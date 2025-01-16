import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: Params) {
  const id = (await params).id;
  const { content } = await req.json();

  if (!id) {
    return NextResponse.json(
      { success: false, message: "ID is missing in the request params" },
      { status: 400 }
    );
  }

  if (!content) {
    return NextResponse.json(
      { success: false, message: "No valid fields to update" },
      { status: 400 }
    );
  }

  try {
    const updatedPost = await prisma.post.update({
      where: { id },
      data: { content },
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