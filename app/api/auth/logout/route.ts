import { NextResponse } from "next/server";
import { logout } from "@/lib/auth";

export async function POST() {
    try {
        await logout();
        return NextResponse.json({ success: true, message: "SESSION TERMINATED." });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "UNABLE TO TERMINATE SESSION." },
            { status: 500 }
        );
    }
}
