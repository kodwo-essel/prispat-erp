"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Users,
    Truck,
    UserCircle,
    CircleDollarSign,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Leaf,
    Settings as SettingsIcon,
    Loader2,
    ShoppingBag,
    History,
    FileText
} from "lucide-react";
import { hasPermission } from "@/lib/permissions";

const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/inventory", label: "Inventory", icon: Package, permission: "VIEW_INVENTORY" },
    { href: "/dashboard/suppliers", label: "Suppliers", icon: Truck, permission: "VIEW_SUPPLIERS" },
    { href: "/dashboard/suppliers/supplies", label: "Supplies", icon: History, permission: "VIEW_SUPPLIERS" },
    { href: "/dashboard/customers", label: "Customers", icon: Users, permission: "VIEW_CUSTOMERS" },
    { href: "/dashboard/sales", label: "Sales & Dispatch", icon: ShoppingBag, permission: "VIEW_CUSTOMERS" },
    { href: "/dashboard/staff", label: "Staff", icon: UserCircle, permission: "VIEW_STAFF" },
    { href: "/dashboard/finance", label: "Finance", icon: CircleDollarSign, permission: "VIEW_FINANCE" },
    { href: "/dashboard/invoices", label: "Invoices", icon: FileText, permission: "VIEW_FINANCE" },
    { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon, permission: "MANAGE_SETTINGS" },
];

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                const data = await res.json();
                if (data.success) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleSignOut = async () => {
        try {
            const res = await fetch("/api/auth/logout", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                router.push("/login");
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <aside
            className={`bg-primary text-white flex flex-col transition-all duration-300 relative print:hidden ${isCollapsed ? "w-16" : "w-64"
                }`}
        >
            {/* Sidebar Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-4 top-20 bg-white text-primary border border-border rounded-full p-2 shadow-md hover:bg-slate-50 transition-colors z-10"
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Branding */}
            <div className={`p-6 border-b border-white/10 flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                <div className="h-8 w-8 bg-white/10 rounded-sm flex items-center justify-center shrink-0">
                    <Leaf size={18} className="text-white" />
                </div>
                {!isCollapsed && (
                    <div className="font-bold tracking-tight text-sm uppercase">Prispat Prime<br />
                        <span className="opacity-60 text-[10px]">Portal</span></div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-grow py-6 px-3 flex flex-col gap-1">
                {navItems
                    .filter(item => !item.permission || hasPermission(user, item.permission as any))
                    .map((item) => {
                        // Find if this is the most specific active route
                        const isActive = item.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname === item.href || (pathname.startsWith(item.href + "/") && !navItems.some(ni => ni.href !== item.href && ni.href.startsWith(item.href) && pathname.startsWith(ni.href)));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200 group relative ${isActive
                                    ? "bg-white/15 text-white font-bold"
                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                                )}
                                <Icon size={18} className={`shrink-0 ${isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`} />
                                {!isCollapsed && <span className="text-xs uppercase tracking-widest leading-none">{item.label}</span>}

                                {/* Tooltip for collapsed mode */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-4 px-2 py-1 bg-primary text-white text-[10px] uppercase tracking-wider rounded-sm opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl border border-white/10">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
            </nav>

            {/* User Area */}
            <div className={`p-4 border-t border-white/10 flex flex-col gap-4 bg-black/10`}>
                {loading ? (
                    <div className="flex items-center justify-center p-2">
                        <Loader2 size={16} className="animate-spin opacity-40" />
                    </div>
                ) : (
                    <Link
                        href="/dashboard/profile"
                        className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} hover:opacity-80 transition-opacity`}
                    >
                        <div className="h-8 w-8 rounded-full bg-slate-800 border border-white/20 shrink-0 flex items-center justify-center text-[10px] font-bold shadow-lg">
                            {user?.name?.split(" ").map((n: string) => n[0]).join("") || "--"}
                        </div>
                        {!isCollapsed && (
                            <div className="overflow-hidden text-left">
                                <div className="text-[10px] font-bold text-white truncate uppercase tracking-tight">{user?.name || "Unauthorized"}</div>
                                <div className="text-[8px] text-white/50 truncate uppercase font-medium">{user?.role || "Restricted Access"}</div>
                            </div>
                        )}
                    </Link>
                )}
                {!isCollapsed && (
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-[10px] font-bold text-white/60 hover:text-white uppercase tracking-widest transition-colors mb-2"
                    >
                        <LogOut size={12} /> Sign Out
                    </button>
                )}
            </div>
        </aside>
    );
}
