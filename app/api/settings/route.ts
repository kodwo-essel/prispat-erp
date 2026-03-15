import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import dbConnect from "@/lib/dbConnect";
import SystemConfig from "@/models/SystemConfig";

export async function GET() {
    try {
        await dbConnect();
        let config = await SystemConfig.findOne({});
        if (!config) {
            config = await SystemConfig.create({});
        }
        return NextResponse.json({ success: true, data: config });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.user.accessLevel !== "Root") {
            return NextResponse.json({ success: false, error: "ACCESS DENIED" }, { status: 403 });
        }
        await dbConnect();
        const body = await request.json();
        const config = await SystemConfig.findOneAndUpdate({}, body, { new: true, upsert: true });
        return NextResponse.json({ success: true, data: config });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
