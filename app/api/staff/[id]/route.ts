import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Staff from "@/models/Staff";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const personnel = await Staff.findById(id);

        if (!personnel) {
            return NextResponse.json({ success: false, error: "Officer not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: personnel });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        // Add audit log entry
        const action = body.status === "Terminated" ? "Access Revoked" : "Identity Modified";

        const personnel = await Staff.findByIdAndUpdate(
            id,
            {
                $set: body,
                $push: {
                    auditLogs: {
                        action,
                        timestamp: new Date(),
                        ip: "INTERNAL",
                        performedBy: body.performedBy || "System Admin"
                    }
                }
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!personnel) {
            return NextResponse.json({ success: false, error: "Officer not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: personnel });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
