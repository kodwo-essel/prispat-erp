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
            const baseUrl = request.nextUrl.origin;
            const configRes = await fetch(`${baseUrl}/api/settings`);
            if (configRes.ok) {
                const configJson = await configRes.json();
                if (configJson.success && configJson.data.maintenanceMode) {
                    return NextResponse.redirect(new URL("/login?error=system_locked", request.url));
                }
            }
        } catch (error) {
            console.error("Middleware System Lock Check Failed:", error);
        }
    }

    // 4. RBAC Route Protection
    if (session && pathname.startsWith("/dashboard")) {
        const user = session.user;
        const restrictions: Record<string, string> = {
            "/dashboard/finance": "VIEW_FINANCE",
            "/dashboard/staff": "VIEW_STAFF",
            "/dashboard/settings": "MANAGE_SETTINGS",
        };

        for (const [route, permission] of Object.entries(restrictions)) {
            if (pathname.startsWith(route)) {
                let allowed = false;
                if (user.accessLevel === "Root") allowed = true;
                else if (permission === "VIEW_FINANCE") {
                    if (user.department === "Finance & Accounting" || user.department === "Executive Admin") allowed = true;
                } else if (permission === "VIEW_STAFF") {
                    if (user.department === "Executive Admin") allowed = true;
                } else if (permission === "MANAGE_SETTINGS") {
                    if (user.accessLevel === "Root") allowed = true;
                }

                if (!allowed) {
                    return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
                }
            }
        }
    }

    // 5. Refresh session for active users
    if (session) {
        return await updateSession(request);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
};
