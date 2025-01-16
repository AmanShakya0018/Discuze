import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


interface Params {
    params: 
        Promise<{ id: string }>
    };

export async function GET(req: NextRequest, { params }: Params) {
    try {
        const id = (await params).id;

        if (!id) {
            return NextResponse.json({ success: false, message: "ID is missing in the request params" }, { status: 400 });
        }

        const isDeleted = await prisma.post.delete({
            where: {
                id: id
            }
        });

        if (!isDeleted) {
            return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Post deleted successfully" }, { status: 200 });

    } catch (e) {
        return NextResponse.json({ success: false, message: "Internal Server Error" + e }, { status: 500 });
    }
}