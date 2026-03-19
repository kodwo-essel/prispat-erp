"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    FileText,
    ArrowRight,
    Download,
    Printer,
    Loader2,
    Calendar,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await fetch("/api/finance/invoices");
                const json = await res.json();
                if (json.success) {
                    setInvoices(json.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch invoices:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    const filteredInvoices = invoices.filter(inv =>
        inv.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.txId && inv.txId.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Billing & Invoices</h1>
                    <p className="text-sm text-secondary mt-1">Manage and generate professional invoices for institutional clients.</p>
                </div>
                <Link href="/dashboard/invoices/new" className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Plus size={14} /> Create New Invoice
                </Link>
            </div>

            <div className="bg-white border border-border p-4 rounded-sm flex items-center justify-between gap-4">
                <div className="relative flex-grow max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                    <input
                        type="text"
                        placeholder="Search by Institution or Invoice #..."
                        className="bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                    Real-time Billing Sync Active
                </div>
            </div>

            <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                {loading ? (
                    <div className="flex-grow flex flex-col items-center justify-center gap-4 text-slate-400">
                        <Loader2 size={32} className="animate-spin text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest">Accessing Ledger...</span>
                    </div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center gap-4 text-slate-400">
                        <FileText size={48} className="opacity-20" />
                        <span className="text-sm font-medium">No invoices found.</span>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse font-medium">
                        <thead>
                            <tr className="bg-muted border-b border-border">
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Invoice #</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Client</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Date</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Total</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Paid</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Balance</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Status</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-xs">
                            {filteredInvoices.map((inv) => (
                                <tr key={inv._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-primary tabular-nums">{inv.txId || `INV-${inv._id.substring(0, 6)}`}</td>
                                    <td className="px-6 py-4 text-slate-700">{inv.entity}</td>
                                    <td className="px-6 py-4 text-secondary">{new Date(inv.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 tabular-nums">₵{inv.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 tabular-nums text-green-600 font-bold">₵{(inv.totalPaid || 0).toLocaleString()}</td>
                                    <td className={`px-6 py-4 tabular-nums font-bold ${inv.amount - (inv.totalPaid || 0) <= 0 ? "text-slate-900" : "text-red-600"}`}>
                                        {inv.amount - (inv.totalPaid || 0) <= 0 ? "-" : `₵${(inv.amount - (inv.totalPaid || 0)).toLocaleString()}`}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight ${inv.status === 'Settled' ? 'bg-green-50 text-green-600 border border-green-100' :
                                            inv.status === 'Partial' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                inv.status === 'Unpaid' || inv.status === 'Pending' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                    'bg-slate-50 text-slate-600 border border-slate-100'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/dashboard/invoices/${inv._id}`}
                                            className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline uppercase tracking-widest ml-2"
                                        >
                                            Details <ArrowRight size={10} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div className="px-6 py-3 bg-muted border-t border-border flex items-center justify-between mt-auto">
                    <div className="text-[10px] text-secondary uppercase tracking-widest font-bold">Invoicing Registry Audit</div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-not-allowed">
                            <ChevronLeft size={12} /> Previous
                        </button>
                        <button className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-not-allowed">
                            Next <ChevronRight size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
