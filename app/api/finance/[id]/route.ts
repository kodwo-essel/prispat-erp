import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import dbConnect from "@/lib/dbConnect";
import Finance from "@/models/Finance";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.user, "VIEW_FINANCE")) {
            return NextResponse.json({ success: false, error: "ACCESS DENIED: UNAUTHORIZED." }, { status: 403 });
        }

        await dbConnect();
        const { id } = await params;
        const transaction = await Finance.findById(id);

        if (!transaction) {
            return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: transaction });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.user, "MANAGE_FINANCE")) {
            return NextResponse.json({ success: false, error: "ACCESS DENIED" }, { status: 403 });
        }

        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const updated = await Finance.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
