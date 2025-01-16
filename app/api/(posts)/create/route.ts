import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
  const {userId, content}  = await req.json();

  try {
    const post = await prisma.post.create({
      data: {
        content,
        user: {
          connect: { id: userId },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ success: false, message: "Failed to add post" }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: "post added successfully" }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal Server error" + error }, { status: 500 });
}
}