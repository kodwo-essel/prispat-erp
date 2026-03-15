import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import dbConnect from "@/lib/dbConnect";
import SupplierAudit from "@/models/SupplierAudit";
import Supplier from "@/models/Supplier";

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.user, "VIEW_SUPPLIERS")) {
            return NextResponse.json({ success: false, error: "ACCESS DENIED: UNAUTHORIZED." }, { status: 403 });
        }
        await dbConnect();
        const audits = await SupplierAudit.find({}).populate("supplierId", "name").sort({ date: -1 });
        return NextResponse.json({ success: true, data: audits });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.user, "MANAGE_SUPPLIERS")) {
            return NextResponse.json({ success: false, error: "ACCESS DENIED: UNAUTHORIZED." }, { status: 403 });
        }
        await dbConnect();
        const body = await request.json();

        // Auto-generate audit ID if not provided
        if (!body.auditId) {
            body.auditId = `AUD-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        const audit = await SupplierAudit.create(body);
        return NextResponse.json({ success: true, data: audit }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
