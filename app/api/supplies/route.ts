import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Supply from "@/models/Supply";

export async function GET() {
    try {
        await dbConnect();
        const supplies = await Supply.find({}).sort({ arrivalDate: -1 });
        return NextResponse.json({ success: true, data: supplies });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
