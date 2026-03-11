import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Staff from "@/models/Staff";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, error: "NOT AUTHENTICATED." }, { status: 401 });
        }

        await dbConnect();
        // Fetch full staff details to ensure fresh data
        const staff = await Staff.findById(session.user.id);

        if (staff) {
            return NextResponse.json({ success: true, user: staff });
        }

        // Fallback to session data if DB record is missing (unlikely)
        return NextResponse.json({ success: true, user: session.user });
    } catch (error) {
        return NextResponse.json({ success: false, error: "SYSTEM FAILURE." }, { status: 500 });
    }
}
