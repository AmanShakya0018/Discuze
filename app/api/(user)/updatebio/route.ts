import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bioSchema = z.object({
  userId: z.string().uuid("Invalid userId"),
  bio: z.string().max(149, "Bio must not exceed 149 characters").optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, bio } = bioSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { bio: bio || "" },
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Failed to update bio" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Bio updated successfully", user: updatedUser },
      { status: 200 }
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
