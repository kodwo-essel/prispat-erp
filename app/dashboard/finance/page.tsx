"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    FileText,
    ArrowRight,
    Download,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle,
    ExternalLink,
    Filter as FilterIcon,
    TrendingUp,
    TrendingDown
} from "lucide-react";
import { exportToCSV } from "@/lib/exportUtils";
import TablePagination from "@/app/dashboard/components/TablePagination";

export default function FinancePage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const handleExport = () => {
        if (!transactions || transactions.length === 0) return;
        const exportData = transactions.map(tx => ({
            TransactionID: tx.txId,
            Entity: tx.entity,
            Category: tx.category,
            Nature: tx.type,
            Amount: tx.amount,
            Date: new Date(tx.date).toLocaleDateString(),
            Status: tx.status,
            Reference: tx.reference || "N/A"
        }));
        exportToCSV(exportData, `Fiscal_Audit_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    };

    useEffect(() => {
        const fetchFinance = async () => {
            setLoading(true);
            setError(null);

            const timer = setTimeout(() => {
                if (loading) setError("System is taking longer than usual to sync. Please check your connection.");
            }, 8000);

            try {
                // Fetch transactions (PAY-*, TX-*) and invoices (INV-*) in parallel
                const [txRes, invRes] = await Promise.all([
                    fetch("/api/finance", { cache: "no-store" }),
                    fetch("/api/finance/invoices", { cache: "no-store" })
                ]);
                const txJson = await txRes.json();
                const invJson = await invRes.json();

                if (txJson.success) {
                    setTransactions(txJson.data || []);
                } else {
                    setError(txJson.error || "Failed to retrieve fiscal data.");
                }
                if (invJson.success) {
                    setInvoices(invJson.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch finance:", error);
                setError("Network error: Could not reach central ledger.");
            } finally {
                setLoading(false);
                clearTimeout(timer);
            }
        };

        fetchFinance();
    }, []);

    // Calculate dynamic stats from both transactions and invoices
    const stats = useMemo(() => {
        const now = new Date();
        const currentDay = now.getDay();
        const daysSinceMonday = (currentDay === 0 ? 6 : currentDay - 1);
        const thisMonday = new Date(now);
        thisMonday.setDate(now.getDate() - daysSinceMonday);
        thisMonday.setHours(0, 0, 0, 0);

        const lastMonday = new Date(thisMonday);
        lastMonday.setDate(thisMonday.getDate() - 7);

        // Weekly Revenue (Current Mon - Now)
        const weeklyRevenue = transactions.reduce((sum, tx) => {
            const txDate = new Date(tx.date).getTime();
            if (txDate >= thisMonday.getTime() && tx.status === 'Settled' && (tx.type === 'Revenue' || tx.parentInvoiceId)) {
                return sum + (Number(tx.amount) || 0);
            }
            return sum;
        }, 0);

        // Previous Week Revenue (Last Mon - Last Sun)
        const previousWeekRevenue = transactions.reduce((sum, tx) => {
            const txDate = new Date(tx.date).getTime();
            if (txDate >= lastMonday.getTime() && txDate < thisMonday.getTime() && tx.status === 'Settled' && (tx.type === 'Revenue' || tx.parentInvoiceId)) {
                return sum + (Number(tx.amount) || 0);
            }
            return sum;
        }, 0);

        const revDiff = weeklyRevenue - previousWeekRevenue;
        const revPercent = previousWeekRevenue > 0 ? (revDiff / previousWeekRevenue) * 100 : (weeklyRevenue > 0 ? 100 : 0);

        // Total Expenditure: Sum of all expense-type transactions
        const totalExpenditure = transactions
            .filter(tx => ['Expense', 'Payroll', 'Tax'].includes(String(tx.type).trim()))
            .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

        // A/R: Sum of remaining balances on non-settled invoices (from invoices endpoint)
        const accountsReceivable = invoices
            .filter(inv =>
                inv.status !== "Cancelled" && inv.status !== "Settled"
            )
            .reduce((sum, inv) => sum + ((Number(inv.amount) || 0) - (Number(inv.totalPaid) || 0)), 0);

        // Total Revenue: Sum of all settled payments
        const totalRevenue = transactions.reduce((sum, tx) => {
            if (tx.status === 'Settled' && (tx.type === 'Revenue' || tx.parentInvoiceId)) {
                return sum + (Number(tx.amount) || 0);
            }
            return sum;
        }, 0);

        const netPosition = totalRevenue - totalExpenditure;

        return {
            weeklyRevenue,
            totalExpenditure,
            accountsReceivable,
            netPosition,
            revPercent
        };
    }, [transactions, invoices]);

    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch =
            tx.txId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = typeFilter === "All" || tx.type === typeFilter;

        return matchesSearch && matchesType;
    });

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, typeFilter]);

    const totalPages = Math.ceil(filteredTransactions.length / pageSize);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className="flex flex-col gap-6">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Fiscal Audit Ledger</h1>
                    <p className="text-sm text-secondary mt-1">Real-time recording of institutional revenue and expenditure.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 text-xs font-bold text-primary border border-primary px-4 py-2 rounded-sm hover:bg-primary/5 uppercase tracking-wider transition-colors"
                    >
                        <Download size={14} /> Export Ledger (CSV)
                    </button>
                    <Link href="/dashboard/finance/new" className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider">
                        <Plus size={14} /> Record Transaction
                    </Link>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-sm flex items-center gap-3 text-red-600 transition-all">
                    <AlertCircle size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">{error}</span>
                    <button onClick={() => window.location.reload()} className="ml-auto text-[10px] bg-red-600 text-white px-3 py-1 rounded-sm font-black hover:bg-red-700">RETRY SYSTEM SYNC</button>
                </div>
            )}

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    {
                        label: "Revenue (This Week)",
                        value: stats.weeklyRevenue,
                        color: "text-primary",
                        info: stats.revPercent === 0 ? "No Prior Activity" : `${stats.revPercent > 0 ? '+' : ''}${stats.revPercent.toFixed(1)}% vs Last Week`,
                        trend: stats.revPercent > 0 ? 'up' : stats.revPercent < 0 ? 'down' : 'neutral'
                    },
                    { label: "Total Expenditure", value: stats.totalExpenditure, color: "text-primary", info: "Institutional Spend" },
                    { label: "Accounts Receivable", value: stats.accountsReceivable, color: "text-amber-600", info: "Pending Invoices" },
                    { label: "Net Fiscal Position", value: stats.netPosition, color: "text-primary", info: "Current Liquidity" },
                ].map((m, idx) => (
                    <div key={idx} className="bg-white border border-border p-4 rounded-sm h-[88px] flex flex-col justify-between">
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">{m.label}</div>
                        <div className="flex items-end justify-between">
                            {loading ? (
                                <div className="flex items-center gap-2 animate-pulse">
                                    <div className="h-6 w-24 bg-muted rounded-sm"></div>
                                    <Loader2 size={12} className="animate-spin text-slate-300" />
                                </div>
                            ) : (
                                <>
                                    <div className={`text-xl font-bold ${m.color}`}>₵{m.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    {m.trend && m.trend !== 'neutral' && (
                                        <div className={`flex items-center gap-0.5 text-[10px] font-bold ${m.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                            {m.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <div className={`text-[10px] font-medium mt-1 ${m.label === 'Revenue (This Week)' && !loading ? (stats.revPercent >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold') : 'text-slate-400'}`}>
                            {loading ? "Synchronizing..." : m.info}
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters Bar */}
            <div className="bg-white border border-border p-4 rounded-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-grow">
                    <div className="relative flex-grow max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                        <input
                            type="text"
                            placeholder="Search by Tx ID, Entity or Category..."
                            className="bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest hidden lg:block">Nature:</span>
                        <div className="flex bg-muted p-1 rounded-sm border border-border overflow-x-auto max-w-full">
                            {["All", "Revenue", "Expense", "Payroll", "Tax"].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setTypeFilter(type)}
                                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all whitespace-nowrap ${typeFilter === type ? "bg-white text-primary shadow-sm border border-border" : "text-secondary hover:text-primary"}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                {loading ? (
                    <div className="flex-grow flex flex-col items-center justify-center gap-4 text-slate-400">
                        <Loader2 size={32} className="animate-spin text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest">Accessing Secure Records...</span>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center gap-4 text-slate-400 p-12">
                        <FileText size={48} className="opacity-20" />
                        <div className="text-center">
                            <span className="text-sm font-medium block">No fiscal records found in current batch.</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Ready for initial ledger entry</span>
                        </div>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted border-b border-border">
                                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary text-center">#</th>
                                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary">Transaction ID</th>
                                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary">Linked Invoice/Ref</th>
                                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary">Entity</th>
                                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary">Category</th>
                                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary">Type</th>
                                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Amount</th>
                                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary text-center">Status</th>
                                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paginatedTransactions.map((tx, index) => (
                                <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-slate-400 tabular-nums">{(currentPage - 1) * pageSize + index + 1}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 text-xs font-bold text-primary tabular-nums">{tx.txId}</td>
                                    <td className="px-4 py-2.5">
                                        {tx.isInvoice ? (
                                            <Link
                                                href={`/dashboard/invoices/${tx.txId}`}
                                                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                            >
                                                {tx.txId} <ExternalLink size={10} />
                                            </Link>
                                        ) : tx.parentInvoiceId ? (
                                            <Link
                                                href={`/dashboard/invoices/${tx.parentInvoiceId}`}
                                                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-700 hover:underline"
                                            >
                                                {tx.parentInvoiceId} <ExternalLink size={10} />
                                            </Link>
                                        ) : (
                                            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-40">
                                                Direct {tx.type}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-slate-700">{tx.entity}</td>
                                    <td className="px-4 py-2.5 text-xs text-secondary">{tx.category}</td>
                                    <td className="px-4 py-2.5">
                                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-tighter ${tx.type === 'Revenue' ? 'bg-green-50 text-green-700 border border-green-200' :
                                            tx.type === 'Expense' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                'bg-slate-50 text-slate-600 border border-slate-300'
                                            }`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-2.5 text-xs text-right font-bold tabular-nums ${tx.type === 'Revenue' || tx.type === 'Settlement' ? 'text-green-600' : 'text-primary'}`}>
                                        {tx.type === 'Revenue' || tx.type === 'Settlement' ? '+' : '-'}₵{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-2.5 text-center">
                                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter ${tx.status === 'Settled' ? 'bg-green-50 text-green-600 border border-green-200' :
                                            tx.status === 'Partial' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                                'bg-red-50 text-red-600 border border-red-200'
                                            }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <Link href={`/dashboard/finance/${tx._id}`} className="inline-flex items-center justify-end gap-1 text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                                            View Details <ArrowRight size={10} />
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
                    totalRecords={filteredTransactions.length}
                    pageSize={pageSize}
                />
            </div>
        </div >
    );
}
