import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const occupationSchema = z.object({
  userId: z.string().uuid("Invalid userId"),
  occupation: z.string().max(30, "Occupation must not exceed 30 characters").min(1, "Occupation is required"),
});

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, occupation } = occupationSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { occupation: occupation},
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Failed to update occupation" },
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
