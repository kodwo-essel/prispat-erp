import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Customer from "@/models/Customer";

export async function GET() {
    try {
        await dbConnect();
        const customers = await Customer.find({}).sort({ updatedAt: -1 });
        return NextResponse.json({ success: true, data: customers });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const customer = await Customer.create(body);
        return NextResponse.json({ success: true, data: customer }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
