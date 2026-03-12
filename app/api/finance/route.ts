import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import dbConnect from "@/lib/dbConnect";
import Finance from "@/models/Finance";

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.user, "VIEW_FINANCE")) {
            return NextResponse.json({ success: false, error: "ACCESS DENIED: UNAUTHORIZED." }, { status: 403 });
        }
        await dbConnect();
        const transactions = await Finance.find({}).sort({ date: -1 });
        return NextResponse.json({ success: true, data: transactions });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.user, "MANAGE_FINANCE")) {
            return NextResponse.json({ success: false, error: "ACCESS DENIED: UNAUTHORIZED." }, { status: 403 });
        }
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
