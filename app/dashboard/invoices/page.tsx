"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    FileText,
    ArrowRight,
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    Filter
} from "lucide-react";
import TablePagination from "@/app/dashboard/components/TablePagination";

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<"All" | "Revenue" | "Expense">("All");
    const [statusFilter, setStatusFilter] = useState("All");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

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

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (inv.txId && inv.txId.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = typeFilter === "All" || inv.type === typeFilter;
        const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, typeFilter, statusFilter]);

    const totalPages = Math.ceil(filteredInvoices.length / pageSize);
    const paginatedInvoices = filteredInvoices.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Billing & Invoices</h1>
                    <p className="text-sm text-secondary mt-1">Manage and generate professional invoices for institutional clients.</p>
                </div>
                <Link href="/dashboard/invoices/new" className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider font-bold">
                    <Plus size={14} /> Create New Invoice
                </Link>
            </div>

            <div className="bg-white border border-border p-4 rounded-sm flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="relative flex-grow max-w-sm w-full">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                    <input
                        type="text"
                        placeholder="Search by Institution or Invoice #..."
                        className="bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest hidden lg:block">Type:</span>
                        <div className="flex bg-muted p-1 rounded-sm border border-border">
                            {(["All", "Revenue", "Expense"] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTypeFilter(type)}
                                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${typeFilter === type ? "bg-white text-primary shadow-sm border border-border" : "text-secondary hover:text-primary"}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest hidden lg:block">Status:</span>
                        <div className="flex bg-muted p-1 rounded-sm border border-border">
                            {["All", "Settled", "Partial", "Pending", "Cancelled"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${statusFilter === status ? "bg-white text-primary shadow-sm border border-border" : "text-secondary hover:text-primary"}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
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
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted border-b border-border text-[10px] font-bold uppercase tracking-widest text-secondary">
                                <th className="px-4 py-3 text-center">#</th>
                                <th className="px-6 py-3">Invoice #</th>
                                <th className="px-6 py-3">Client</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3">Paid</th>
                                <th className="px-6 py-3">Balance</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-xs font-medium">
                            {paginatedInvoices.map((inv, index) => (
                                <tr key={inv._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-4 text-center">
                                        <span className="text-[10px] font-bold text-slate-400 tabular-nums">{(currentPage - 1) * pageSize + index + 1}</span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-primary tabular-nums">{inv.txId || `INV-${inv._id.substring(0, 6)}`}</td>
                                    <td className="px-6 py-4 text-slate-700">{inv.entity}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest ${inv.type === 'Revenue' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {inv.type || 'Revenue'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-secondary tabular-nums uppercase font-bold text-[10px]">
                                        {new Date(inv.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 tabular-nums">₵{inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="px-6 py-4 tabular-nums text-green-600 font-bold">₵{(inv.totalPaid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className={`px-6 py-4 tabular-nums font-bold ${inv.amount - (inv.totalPaid || 0) <= 0 ? "text-slate-900" : "text-red-600"}`}>
                                        {inv.amount - (inv.totalPaid || 0) <= 0 ? "-" : `₵${(inv.amount - (inv.totalPaid || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter border ${inv.status === 'Settled' ? 'bg-green-50 text-green-600 border-green-200' :
                                            inv.status === 'Partial' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                inv.status === 'Unpaid' || inv.status === 'Pending' ? 'bg-red-50 text-red-600 border-red-200' :
                                                    'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right tabular-nums">
                                        <Link
                                            href={`/dashboard/invoices/${inv._id}`}
                                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                        >
                                            Details <ArrowRight size={10} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalRecords={filteredInvoices.length}
                    pageSize={pageSize}
                />
            </div>
        </div>
    );
}
