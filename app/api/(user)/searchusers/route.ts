import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, image: true,isVerified:true },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.log("Internal server error", error);
    return NextResponse.error();
  }
}
