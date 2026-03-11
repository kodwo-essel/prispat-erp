import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SystemConfig from "@/models/SystemConfig";

export async function GET() {
    try {
        await dbConnect();
        let config = await SystemConfig.findOne();

        if (!config) {
            config = await SystemConfig.create({});
        }

        return NextResponse.json({ success: true, data: config });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        let config = await SystemConfig.findOneAndUpdate({}, body, {
            new: true,
            upsert: true,
            runValidators: true,
        });

        return NextResponse.json({ success: true, data: config });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
