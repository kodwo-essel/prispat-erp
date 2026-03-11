"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Users,
    Truck,
    UserCircle,
    CircleDollarSign,
    ChevronLeft,
    ChevronRight,
    LogOut
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/inventory", label: "Inventory", icon: Package },
    { href: "/dashboard/suppliers", label: "Suppliers", icon: Truck },
    { href: "/dashboard/customers", label: "Customers", icon: Users },
    { href: "/dashboard/staff", label: "Staff", icon: UserCircle },
    { href: "/dashboard/finance", label: "Finance", icon: CircleDollarSign },
];

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <aside
            className={`bg-primary text-white flex flex-col transition-all duration-300 relative ${isCollapsed ? "w-16" : "w-64"
                }`}
        >
            {/* Sidebar Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 bg-white text-primary border border-border rounded-full p-1 shadow-md hover:bg-slate-50 transition-colors z-10"
            >
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>

            {/* Branding */}
            <div className={`p-6 border-b border-white/10 flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                <div className="h-8 w-8 bg-white/10 rounded-sm flex items-center justify-center shrink-0">
                    <span className="font-black text-lg">A</span>
                </div>
                {!isCollapsed && (
                    <div className="font-bold tracking-tight text-sm uppercase">Agrochem<br /><span className="opacity-60 text-[10px]">Central Portal</span></div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-grow py-6 px-3 flex flex-col gap-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
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
                <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                    <div className="h-8 w-8 rounded-full bg-slate-500 border border-white/20 shrink-0 flex items-center justify-center text-[10px] font-bold">
                        JD
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <div className="text-[10px] font-bold text-white truncate uppercase tracking-tight">John Doe</div>
                            <div className="text-[8px] text-white/50 truncate uppercase font-medium">Administrator</div>
                        </div>
                    )}
                </div>
                {!isCollapsed && (
                    <button className="flex items-center gap-2 text-[10px] font-bold text-white/60 hover:text-white uppercase tracking-widest transition-colors mb-2">
                        <LogOut size={12} /> Sign Out
                    </button>
                )}
            </div>
        </aside>
    );
}
