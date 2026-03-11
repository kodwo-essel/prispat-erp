import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Inventory from "@/models/Inventory";

export async function GET() {
    try {
        await dbConnect();
        const items = await Inventory.find({}).sort({ updatedAt: -1 });
        return NextResponse.json({ success: true, data: items });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const item = await Inventory.create(body);
        return NextResponse.json({ success: true, data: item }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
