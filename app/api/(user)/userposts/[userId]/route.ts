import { NextResponse } from "next/server";
import prisma from "@/lib/db";

interface Params{
  params: Promise<{userId:string}>
}

export async function GET(request: Request, { params }: Params) {
  try {
    const {userId} = await params;

    const userPosts = await prisma.post.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc', 
      },
    });

    return NextResponse.json(userPosts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return NextResponse.error();
  }
}
