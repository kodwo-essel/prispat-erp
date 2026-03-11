"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, ChevronDown, Shield, Settings } from "lucide-react";

export default function UserMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div className="relative" ref={menuRef}>
            {/* User Profile Trigger */}
            <button
                onClick={toggleMenu}
                className="flex items-center gap-3 pl-4 border-l border-border hover:opacity-80 transition-opacity"
            >
                <div className="text-right hidden sm:block">
                    <div className="text-[10px] font-black text-primary uppercase tracking-tighter">Admin User</div>
                    <div className="text-[8px] text-secondary font-bold uppercase tracking-widest">Systems Director</div>
                </div>
                <div className="relative">
                    <div className="h-9 w-9 bg-slate-100 rounded-sm border border-border flex items-center justify-center text-primary font-black text-xs shadow-sm overflow-hidden group-hover:border-primary transition-colors">
                        <User size={18} />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <ChevronDown size={12} className={`text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-sm shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-border mb-1">
                        <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">Authentication Node</div>
                        <div className="text-[9px] text-secondary font-bold truncate">GH-ACCRA-MAIN-01</div>
                    </div>

                    <Link
                        href="/dashboard/staff/current-user"
                        className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-secondary uppercase tracking-widest hover:bg-slate-50 hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <Shield size={14} className="opacity-60" />
                        My Security Profile
                    </Link>

                    <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-bold text-secondary uppercase tracking-widest hover:bg-slate-50 hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <Settings size={14} className="opacity-60" />
                        System Settings
                    </button>

                    <div className="h-px bg-border my-1"></div>

                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-red-600 uppercase tracking-widest hover:bg-red-50 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <LogOut size={14} />
                        Terminate Session
                    </Link>
                </div>
            )}
        </div>
    );
}
