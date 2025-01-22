// app/api/allposts/[id]/comment/route.ts

import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } =await params;

  try {
    // Fetch the comments for the specific post
    const comments = await prisma.comment.findMany({
      where: {
        postId: id, // Use the dynamic postId from the URL
      },
      include: {
        user: true, // Include the user data for each comment
      },
      orderBy: {
        createdAt: 'asc', // Order by creation date (oldest first)
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
