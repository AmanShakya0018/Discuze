import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {

  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (posts.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error"},
      { status: 500 }
    );
  }
}