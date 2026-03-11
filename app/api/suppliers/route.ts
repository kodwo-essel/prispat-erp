import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Supplier from "@/models/Supplier";

export async function GET() {
    try {
        await dbConnect();
        const suppliers = await Supplier.find({}).sort({ updatedAt: -1 });
        return NextResponse.json({ success: true, data: suppliers });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const supplier = await Supplier.create(body);
        return NextResponse.json({ success: true, data: supplier }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
