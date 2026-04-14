import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CustomerFeedback from "@/models/CustomerFeedback";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get("customerId");
        
        const filter = customerId ? { customerId } : {};
        const feedback = await CustomerFeedback.find(filter).sort({ date: -1 });
        
        return NextResponse.json({ success: true, data: feedback });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();
        
        const feedback = await CustomerFeedback.create({
            ...body,
            recordedBy: session.user.name || session.user.email,
            date: new Date()
        });
        
        return NextResponse.json({ success: true, data: feedback }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
