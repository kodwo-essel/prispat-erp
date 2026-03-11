"use client";

import { useState, useEffect } from "react";
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
    Loader2
} from "lucide-react";

export default function FinancePage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFinance = async () => {
            try {
                const res = await fetch("/api/finance");
                const json = await res.json();
                if (json.success) {
                    setTransactions(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch finance:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFinance();
    }, []);

    // Calculate dynamic stats
    const calculateStats = () => {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const weeklyRevenue = transactions
            .filter(tx => tx.type === 'Revenue' && new Date(tx.date) >= sevenDaysAgo)
            .reduce((sum, tx) => sum + tx.amount, 0);

        const totalExpenditure = transactions
            .filter(tx => ['Expense', 'Payroll', 'Tax'].includes(tx.type))
            .reduce((sum, tx) => sum + tx.amount, 0);

        const accountsReceivable = transactions
            .filter(tx => tx.type === 'A/R')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const totalRevenue = transactions
            .filter(tx => tx.type === 'Revenue')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const netPosition = totalRevenue - totalExpenditure;

        return { weeklyRevenue, totalExpenditure, accountsReceivable, netPosition };
    };

    const stats = calculateStats();

    return (
        <div className="flex flex-col gap-6">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Fiscal Audit Ledger</h1>
                    <p className="text-sm text-secondary mt-1">Real-time recording of institutional revenue and expenditure.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 text-xs font-bold text-primary border border-primary px-4 py-2 rounded-sm hover:bg-primary/5 uppercase tracking-wider transition-colors">
                        <Download size={14} /> Download Ledger (PDF)
                    </button>
                    <Link href="/dashboard/finance/new" className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider">
                        <Plus size={14} /> Record Transaction
                    </Link>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-border p-4 rounded-sm">
                    <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Weekly Revenue</div>
                    <div className="text-xl font-bold text-primary">₵{stats.weeklyRevenue.toLocaleString()}</div>
                    <div className="text-[10px] text-green-600 font-bold mt-1">Live Calculation</div>
                </div>
                <div className="bg-white border border-border p-4 rounded-sm">
                    <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Total Expenditure</div>
                    <div className="text-xl font-bold text-primary">₵{stats.totalExpenditure.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1">Institutional Spend</div>
                </div>
                <div className="bg-white border border-border p-4 rounded-sm">
                    <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Accounts Receivable</div>
                    <div className="text-xl font-bold text-amber-600">₵{stats.accountsReceivable.toLocaleString()}</div>
                    <div className="text-[10px] text-secondary font-medium mt-1">Pending Invoices</div>
                </div>
                <div className="bg-white border border-border p-4 rounded-sm">
                    <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Net Fiscal Position</div>
                    <div className="text-xl font-bold text-primary">₵{stats.netPosition.toLocaleString()}</div>
                    <div className="text-[10px] text-primary/60 font-medium mt-1">Current Liquidity</div>
                </div>
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
                                        <div className={`text - xs font - bold tabular - nums ${tx.type === 'Revenue' ? 'text-green-600' : 'text-slate-900'} `}>
                                            {tx.type === 'Revenue' ? '+' : '-'} {tx.amount.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-secondary tabular-nums">
                                        {new Date(tx.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text - [9px] font - bold px - 2 py - 0.5 rounded - full uppercase tracking - tight ${tx.status === 'Settled' ? 'bg-green-50 text-green-600 border border-green-100' :
                                            tx.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                'bg-red-50 text-red-600 border border-red-100'
                                            } `}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/ dashboard / finance / ${tx._id} `} className="inline-flex items-center justify-end gap-1 text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
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
                    <div className="text-[10px] text-secondary italic">Restricted View: Audit trail logged for current session.</div>
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
