import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface Params {
    params: Promise<{ id: string }>;
  }
  
  export async function DELETE(req: NextRequest, { params }: Params) {
    try {
      const { id } = await params;
  
      if (!id) {
        return NextResponse.json({ success: false, message: "ID is missing in the request params" }, { status: 400 });
      }

    const deletedComment = await prisma.comment.delete({
      where:{
        id:id
      }
    });

    if (!deletedComment) {
      return NextResponse.json({ success: false, message: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Comment Deleted successfully", deletedComment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
