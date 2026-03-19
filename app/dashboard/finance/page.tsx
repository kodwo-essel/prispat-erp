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
    AlertCircle
} from "lucide-react";
import { exportToCSV } from "@/lib/exportUtils";

export default function FinancePage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

            // Set a secondary timeout for UX if the network is extremely slow
            const timer = setTimeout(() => {
                if (loading) setError("System is taking longer than usual to sync. Please check your connection.");
            }, 8000);

            try {
                const res = await fetch("/api/finance", { cache: "no-store" });
                const json = await res.json();
                if (json.success) {
                    setTransactions(json.data || []);
                } else {
                    setError(json.error || "Failed to retrieve fiscal data.");
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

    // Calculate dynamic stats with useMemo to prevent unnecessary recalcs and sync with data load
    const stats = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return { weeklyRevenue: 0, totalExpenditure: 0, accountsReceivable: 0, netPosition: 0 };
        }

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const weeklyRevenue = transactions
            .filter(tx => String(tx.type).trim() === 'Revenue' && new Date(tx.date).getTime() >= sevenDaysAgo.getTime())
            .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

        const totalExpenditure = transactions
            .filter(tx => ['Expense', 'Payroll', 'Tax'].includes(String(tx.type).trim()))
            .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

        const accountsReceivable = transactions
            .filter(tx => String(tx.type).trim() === 'A/R')
            .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

        const totalRevenue = transactions
            .filter(tx => String(tx.type).trim() === 'Revenue')
            .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

        const netPosition = totalRevenue - totalExpenditure;

        return { weeklyRevenue, totalExpenditure, accountsReceivable, netPosition };
    }, [transactions]);

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
                    { label: "Weekly Revenue", value: stats.weeklyRevenue, color: "text-primary", info: "Live Calculation" },
                    { label: "Total Expenditure", value: stats.totalExpenditure, color: "text-primary", info: "Institutional Spend" },
                    { label: "Accounts Receivable", value: stats.accountsReceivable, color: "text-amber-600", info: "Pending Invoices" },
                    { label: "Net Fiscal Position", value: stats.netPosition, color: "text-primary", info: "Current Liquidity" },
                ].map((m, idx) => (
                    <div key={idx} className="bg-white border border-border p-4 rounded-sm h-[88px] flex flex-col justify-between">
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">{m.label}</div>
                        {loading ? (
                            <div className="flex items-center gap-2 animate-pulse">
                                <div className="h-6 w-24 bg-muted rounded-sm"></div>
                                <Loader2 size={12} className="animate-spin text-slate-300" />
                            </div>
                        ) : (
                            <div className={`text-xl font-bold ${m.color}`}>₵{m.value.toLocaleString()}</div>
                        )}
                        <div className={`text-[10px] font-medium mt-1 ${m.info === 'Live Calculation' ? 'text-green-600 font-bold' : 'text-slate-400'}`}>
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
                        />
                    </div>
                    <select className="bg-white border border-border px-4 py-2 rounded-sm text-xs focus:outline-none focus:border-primary">
                        <option>Current Fiscal Month</option>
                        <option>Last 30 Days</option>
                        <option>Quarterly Report</option>
                        <option>Annual View</option>
                    </select>
                    <button className="flex items-center gap-2 text-xs font-bold text-secondary px-4 py-2 hover:text-primary transition-colors">
                        <Filter size={14} /> Advanced Filters
                    </button>
                </div>
                <div className="text-xs text-secondary font-medium">Synced with Central Bank API</div>
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
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Transaction ID</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Entity / Reference</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Nature</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Amount (GHS)</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Date</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Status</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {transactions.map((tx) => (
                                <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-bold text-primary tabular-nums">{tx.txId}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-semibold text-primary">{tx.entity}</div>
                                        <div className="text-[10px] text-secondary mt-0.5">{tx.category}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-secondary">{tx.type}</td>
                                    <td className="px-6 py-4">
                                        <div className={`text-xs font-bold tabular-nums ${tx.type === 'Revenue' ? 'text-green-600' : 'text-slate-900'}`}>
                                            {tx.type === 'Revenue' ? '+' : '-'} {tx.amount.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-secondary tabular-nums">
                                        {new Date(tx.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight ${tx.status === 'Settled' ? 'bg-green-50 text-green-600 border border-green-100' :
                                            tx.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                'bg-red-50 text-red-600 border border-red-100'
                                            }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/dashboard/finance/${tx._id}`} className="inline-flex items-center justify-end gap-1 text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                                            View Details <ArrowRight size={10} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination Placeholder */}
                <div className="px-6 py-3 bg-muted border-t border-border flex items-center justify-between mt-auto">
                    <div className="text-[10px] text-secondary">Restricted View: Audit trail logged for current session.</div>
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
