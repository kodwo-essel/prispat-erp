"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    FileText,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Loader2
} from "lucide-react";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await fetch("/api/customers");
                const json = await res.json();
                if (json.success) {
                    setCustomers(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch customers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    return (
        <div className="flex flex-col gap-6">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Institutional Client Records</h1>
                    <p className="text-sm text-secondary mt-1">Directory of registered co-operatives, farms, and industrial buyers.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 text-xs font-bold text-primary border border-primary px-4 py-2 rounded-sm hover:bg-primary/5 uppercase tracking-wider transition-colors">
                        <FileText size={14} /> CRM Export
                    </button>
                    <Link href="/dashboard/customers/new" className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider">
                        <Plus size={14} /> Register New Customer
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
                            placeholder="Search by Name, Region or Primary Contact..."
                            className="bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary"
                        />
                    </div>
                    <select className="bg-white border border-border px-4 py-2 rounded-sm text-xs focus:outline-none focus:border-primary">
                        <option>All Regions</option>
                        <option>Greater Accra</option>
                        <option>Ashanti</option>
                        <option>Western North</option>
                        <option>Bono East</option>
                    </select>
                </div>
                <div className="text-xs text-secondary font-medium">Synced with Nationwide Sales Tracker</div>
            </div>

            {/* Customers Table */}
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
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Institution Name</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Region / Hub</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Ops Contact</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Credit Line</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Status</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {customers.map((cust) => (
                                <tr key={cust._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-bold text-primary">{cust.name}</div>
                                        <div className="text-[10px] text-secondary mt-0.5">Verified Institutional Grade</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-secondary">{cust.region}</td>
                                    <td className="px-6 py-4 text-xs text-slate-900 font-medium">{cust.contact}</td>
                                    <td className="px-6 py-4 text-xs font-bold tabular-nums text-primary">₵{(cust.creditLimit || 0).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text - [9px] font - bold px - 2 py - 0.5 rounded - full uppercase tracking - tight ${cust.status === 'Active' ? 'bg-green-50 text-green-600 border border-green-100' :
                                            'bg-amber-50 text-amber-600 border border-amber-100'
                                            } `}>
                                            {cust.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/ dashboard / customers / ${cust._id} `} className="inline-flex items-center justify-end gap-1 text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                                            Manage <ArrowRight size={10} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination Placeholder */}
                <div className="px-6 py-3 bg-muted border-t border-border flex items-center justify-between mt-auto">
                    <div className="text-[10px] text-secondary italic">Accessing Central Customer Database.</div>
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
