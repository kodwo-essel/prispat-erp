import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Staff from "@/models/Staff";
import { login } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { staffId, password } = await request.json();

        // Find staff and include password for comparison
        const staff = await Staff.findOne({ staffId }).select("+credentials.password");

        if (!staff) {
            return NextResponse.json(
                { success: false, error: "ACCESS DENIED: UNKNOWN IDENTITY." },
                { status: 401 }
            );
        }

        if (staff.status !== "Active") {
            return NextResponse.json(
                { success: false, error: "ACCESS DENIED: ACCOUNT SUSPENDED OR TERMINATED." },
                { status: 403 }
            );
        }

        // Use bcrypt directly to avoid issues with missing instance methods on the cached model
        const bcrypt = require("bcryptjs");
        const isPasswordCorrect = await bcrypt.compare(password, staff.credentials.password);

        if (!isPasswordCorrect) {
            return NextResponse.json(
                { success: false, error: "ACCESS DENIED: INVALID SECURITY PROTOCOL." },
                { status: 401 }
            );
        }

        // Create the session
        await login({
            id: staff._id.toString(),
            staffId: staff.staffId,
            name: staff.name,
            role: staff.role,
            email: staff.credentials.email,
            phone: staff.phone,
            department: staff.department,
            accessLevel: staff.accessLevel,
        });

        return NextResponse.json({ success: true, message: "IDENTITY VERIFIED." });
    } catch (error: any) {
        console.error("Login API Error:", error);
        return NextResponse.json(
            { success: false, error: "SYSTEM REJECTION: UNABLE TO AUTHENTICATE." },
            { status: 500 }
        );
    }
}
