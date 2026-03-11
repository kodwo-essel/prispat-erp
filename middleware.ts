import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const session = await getSession();
    const { pathname } = request.nextUrl;

    // 1. If user is authenticated and tries to access /login, redirect to /dashboard
    if (session && pathname.startsWith("/login")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 2. If user is NOT authenticated and tries to access /dashboard, redirect to /login
    if (!session && pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 3. System Lock Enforcement (Maintenance Mode)
    if (session && pathname.startsWith("/dashboard") && session.user.accessLevel !== "Root") {
        try {
            // Fetch system config from the internal API
            const baseUrl = request.nextUrl.origin;
            const configRes = await fetch(`${baseUrl}/api/settings`);
            const configJson = await configRes.json();

            if (configJson.success && configJson.data.maintenanceMode) {
                // System is locked, redirect to lock screen
                return NextResponse.redirect(new URL("/login?error=system_locked", request.url));
            }
        } catch (error) {
            console.error("Middleware System Lock Check Failed:", error);
        }
    }

    // 4. Refresh session for active users
    if (session) {
        return await updateSession(request);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
};
