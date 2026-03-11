"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    FileText,
    History,
    ShieldCheck,
    MoreVertical, // Retained as it's used in the component
    ChevronLeft,
    ChevronRight,
    Loader2
} from "lucide-react";

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const res = await fetch("/api/suppliers");
                const json = await res.json();
                if (json.success) {
                    setSuppliers(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch suppliers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSuppliers();
    }, []);

    const filteredSuppliers = suppliers.filter(sup => {
        const matchesSearch =
            sup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sup.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sup.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = categoryFilter === "All Categories" || sup.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex flex-col gap-6">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Approved Supplier Registry</h1>
                    <p className="text-sm text-secondary mt-1">Registry of authorized agrochemical manufacturers and regional wholesalers.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/suppliers/supplies" className="flex items-center gap-2 text-xs font-bold text-secondary border border-border px-4 py-2 rounded-sm hover:bg-muted uppercase tracking-wider transition-colors">
                        <History size={14} /> Supply Registry
                    </Link>
                    <button className="flex items-center gap-2 text-xs font-bold text-primary border border-primary px-4 py-2 rounded-sm hover:bg-primary/5 uppercase tracking-wider transition-colors">
                        <FileText size={14} /> Audit Report
                    </button>
                    <Link href="/dashboard/suppliers/new" className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider">
                        <Plus size={14} /> Onboard New Supplier
                    </Link>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white border border-border p-4 rounded-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-grow">
                    <div className="relative flex-grow max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                        <input
                            type="text"
                            placeholder="Find manufacturer or local agent..."
                            className="bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-white border border-border px-4 py-2 rounded-sm text-xs focus:outline-none focus:border-primary"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option>All Categories</option>
                        <option>Agrochemicals</option>
                        <option>Fertilizers</option>
                        <option>Equipment</option>
                        <option>Seeds</option>
                    </select>
                </div>
                <div className="text-xs text-secondary font-medium">Verified by Quality Control Unit</div>
            </div>

            {/* Suppliers Table */}
            <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                {loading ? (
                    <div className="flex-grow flex flex-col items-center justify-center gap-4 text-slate-400">
                        <Loader2 size={32} className="animate-spin text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest">Accessing Secure Records...</span>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted border-b border-border">
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Entity Name</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Contact / Ops</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Category</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Reliability</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Status</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredSuppliers.map((sup) => (
                                <tr key={sup._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-primary/10 text-primary flex items-center justify-center rounded-sm font-bold text-xs shadow-sm">
                                                {sup.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-primary">{sup.name}</div>
                                                <div className="text-[10px] text-secondary mt-0.5">{sup.location}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-medium text-slate-900">{sup.contactPerson}</div>
                                        <div className="text-[10px] text-primary underline cursor-pointer">{sup.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-secondary">{sup.category}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between w-24">
                                                <span className="text-[10px] font-bold text-primary">{sup.reliability || '100%'}</span>
                                                <ShieldCheck size={12} className="text-green-600" />
                                            </div>
                                            <div className="h-1 w-24 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: sup.reliability || '100%' }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight ${sup.status === 'Active' ? 'bg-green-50 text-green-600 border border-green-100' :
                                            'bg-amber-50 text-amber-600 border border-amber-100'
                                            }`}>
                                            {sup.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3 text-secondary">
                                            <Link href={`/dashboard/suppliers/${sup._id}`} className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">Manage</Link>
                                            <button className="hover:text-primary transition-colors">
                                                <MoreVertical size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination Placeholder */}
                <div className="px-6 py-3 bg-muted border-t border-border flex items-center justify-between mt-auto">
                    <div className="text-[10px] text-secondary">National Procurement Authority Registered</div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-not-allowed">
                            <ChevronLeft size={12} /> Previous
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="h-6 w-6 bg-primary text-white text-[10px] flex items-center justify-center font-bold rounded-sm shadow-sm">1</span>
                        </div>
                        <button className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-not-allowed">
                            Next <ChevronRight size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
