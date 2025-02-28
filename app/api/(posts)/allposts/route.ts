import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 5; // Fetch 5 posts per request
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      take: limit,
      skip: skip,
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalPosts = await prisma.post.count(); // Get total post count
    const hasMore = skip + posts.length < totalPosts; // Check if more posts exist

    return NextResponse.json({ posts, hasMore }, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
