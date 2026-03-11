import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Staff from "@/models/Staff";

export async function GET() {
    try {
        await dbConnect();
        const personnel = await Staff.find({}).sort({ updatedAt: -1 });
        return NextResponse.json({ success: true, data: personnel });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // In a real app, we would hash the password here
        const personnel = await Staff.create(body);
        return NextResponse.json({ success: true, data: personnel }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
