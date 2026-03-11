import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Staff from "@/models/Staff";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        await dbConnect();
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ success: false, error: "UNAUTHORIZED ACCESS." }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        // Find staff and include password for comparison
        const staff = await Staff.findById(session.user.id).select("+credentials.password");

        if (!staff) {
            return NextResponse.json({ success: false, error: "OFFICER NOT FOUND." }, { status: 404 });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, staff.credentials.password);
        if (!isMatch) {
            return NextResponse.json({ success: false, error: "INVALID CURRENT PASSWORD." }, { status: 400 });
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(10);
        staff.credentials.password = await bcrypt.hash(newPassword, salt);

        // Add audit log
        staff.auditLogs.push({
            action: "Password Reset",
            timestamp: new Date(),
            ip: "INTERNAL",
            performedBy: staff.name
        });

        await staff.save();

        return NextResponse.json({ success: true, message: "SECURITY CREDENTIALS UPDATED." });
    } catch (error: any) {
        console.error("Password change error:", error);
        return NextResponse.json({ success: false, error: "SYSTEM REJECTION: UNABLE TO UPDATE PASSWORD." }, { status: 500 });
    }
}
