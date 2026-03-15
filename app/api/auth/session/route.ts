import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ user: null }, { status: 401 });
        }
        return NextResponse.json({ user: session.user });
    } catch (error: any) {
        return NextResponse.json({ user: null, error: error.message }, { status: 400 });
    }
}
