"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    FileText,
    Shield,
    Mail,
    Phone,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Loader2
} from "lucide-react";

export default function StaffPage() {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("All Roles");

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await fetch("/api/staff");
                const json = await res.json();
                if (json.success) {
                    setStaff(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch staff:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStaff();
    }, []);

    const filteredStaff = staff.filter(person => {
        const matchesSearch =
            person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (person.staffId && person.staffId.toLowerCase().includes(searchQuery.toLowerCase())) ||
            person.role.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = roleFilter === "All Roles" || person.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    return (
        <div className="flex flex-col gap-6">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">National Personnel Directorate</h1>
                    <p className="text-sm text-secondary mt-1">Authorized database of all regional officers and administrative staff.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 text-xs font-bold text-primary border border-primary px-4 py-2 rounded-sm hover:bg-primary/5 uppercase tracking-wider transition-colors">
                        <FileText size={14} /> Personnel Report
                    </button>
                    <Link href="/dashboard/staff/new" className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider">
                        <Plus size={14} /> New Officer Enrolment
                    </Link>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white border border-border p-4 rounded-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-grow">
                    <div className="relative flex-grow max-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                        <input
                            type="text"
                            placeholder="Search by Name, Officer ID or Role..."
                            className="bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-white border border-border px-4 py-2 rounded-sm text-xs focus:outline-none focus:border-primary"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option>All Roles</option>
                        <option>Admin</option>
                        <option>Inventory Manager</option>
                        <option>Finance Officer</option>
                        <option>Regional Director</option>
                    </select>
                </div>
                <div className="text-xs text-secondary font-medium">Clearance required for sensitive data</div>
            </div>

            {/* Staff Grid */}
            {loading ? (
                <div className="bg-white border border-border rounded-sm shadow-sm p-40 flex flex-col items-center justify-center gap-4 text-slate-400">
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest">Accessing Secure Personnel Records...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {filteredStaff.map((person) => (
                        <div key={person._id} className="bg-white border border-border rounded-sm shadow-sm overflow-hidden flex flex-col group">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-14 w-14 bg-muted border border-border rounded-sm flex items-center justify-center text-primary font-bold text-xl uppercase shadow-inner">
                                        {person.name?.split(" ").map((n: string) => n[0]).join("") || "--"}
                                    </div>
                                    <span className={`text-[8px] font-black px-2 py-1 rounded-sm border uppercase tracking-widest ${person.accessLevel === 'Admin' ? 'bg-red-50 text-red-700 border-red-100' :
                                        person.accessLevel === 'Manager' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                            'bg-slate-50 text-slate-700 border-slate-100'
                                        }`}>
                                        {person.accessLevel}
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold text-primary">{person.name}</h3>
                                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">{person.role}</p>

                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center gap-3 text-xs text-secondary">
                                        <Mail size={12} className="text-slate-400" /> {person.credentials?.email}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-secondary">
                                        <Phone size={12} className="text-slate-400" /> {person.phone || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-secondary">
                                        <Shield size={12} className="text-slate-400" /> Clearance: {person.status}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto border-t border-border p-3 bg-muted group-hover:bg-slate-50 transition-colors">
                                <Link href={`/dashboard/staff/${person._id}`} className="flex items-center justify-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                                    Manage Personnel Profile <ArrowRight size={12} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Placeholder */}
            <div className="bg-white border border-border p-4 rounded-sm flex items-center justify-between">
                <div className="text-[10px] text-secondary">Authorized Personnel Directory • Nationwide Access Enabled</div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-not-allowed">
                        <ChevronLeft size={14} /> Previous
                    </button>
                    <button className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
