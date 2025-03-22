import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try{
      const {fullname,email,reason,proof} = await req.json();

      if (!fullname || !email || !reason) {
        return NextResponse.json({ error: "All fields are required." }, { status: 400 });
      }
      const verificationRequest = await prisma.verificationrequest.create({
        data: { fullname, email, reason, proof },
      });
  
      return NextResponse.json(verificationRequest, { status: 200 });

    } catch (error) {
      console.error("Error creating verification request:", error);
      return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}