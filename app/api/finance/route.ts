import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Finance from "@/models/Finance";

export async function GET() {
    try {
        await dbConnect();
        const transactions = await Finance.find({}).sort({ date: -1 });
        return NextResponse.json({ success: true, data: transactions });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Auto-generate transaction ID if not provided
        if (!body.txId) {
            body.txId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        const transaction = await Finance.create(body);
        return NextResponse.json({ success: true, data: transaction }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
