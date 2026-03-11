"use client";

import Link from "next/link";
import {
    ChevronLeft,
    Search,
    Filter,
    Download,
    FileSpreadsheet,
    Printer,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    MoreVertical,
    ArrowRight
} from "lucide-react";

export default function FinancialLedgerPage() {
    const transactions = [
        { id: "TX-9001", entity: "Green Valley Co-op", type: "Revenue", category: "Agro-Input Sales", amount: "+$4,250.00", date: "2026-03-11", status: "Settled", node: "GH-Accra" },
        { id: "TX-9002", entity: "AgroGen Hub", type: "Expense", category: "Procurement Cost", amount: "-$12,400.00", date: "2026-03-10", status: "Pending", node: "GH-Kumasi" },
        { id: "TX-9003", entity: "Northern Soils", type: "Asset", category: "Accounts Receivable", amount: "+$8,500.00", date: "2026-03-10", status: "Overdue", node: "GH-Tamale" },
        { id: "TX-9004", entity: "National Tax Board", type: "Liability", category: "Institutional Tax", amount: "-$1,200.00", date: "2026-03-09", status: "Settled", node: "GH-Accra" },
        { id: "TX-9005", entity: "Staff Payroll", type: "Expense", category: "Personnel Payroll", amount: "-$6,800.00", date: "2026-03-01", status: "Settled", node: "Global" },
        { id: "TX-9006", entity: "Modern Agro Retail", type: "Revenue", category: "Agro-Input Sales", amount: "+$2,100.00", date: "2026-02-28", status: "Settled", node: "GH-Accra" },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <Link href="/dashboard/finance" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors">
                        <ChevronLeft size={12} /> Back to Overview
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Master Financial Ledger</h1>
                    <p className="text-secondary text-sm">Historical archive of all transactions, audits, and adjustments.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 text-xs font-bold text-secondary border border-border px-4 py-2 rounded-sm hover:bg-slate-50 transition-colors uppercase tracking-wider">
                        <Printer size={14} /> Print Ledger
                    </button>
                    <button className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        <FileSpreadsheet size={14} /> Export to XLSX
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-border p-4 rounded-sm shadow-sm flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-50" />
                    <input
                        type="text"
                        placeholder="Filter by ID, entity, or reference..."
                        className="w-full bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-xs focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-48">
                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-50" />
                        <select className="w-full bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-xs focus:outline-none appearance-none font-bold uppercase tracking-tighter">
                            <option>Current Fiscal Month</option>
                            <option>Q1 2026 (Jan - Mar)</option>
                            <option>Full Year 2025</option>
                            <option>Custom Range...</option>
                        </select>
                    </div>
                    <button className="bg-muted border border-border p-2 rounded-sm text-secondary hover:text-primary transition-colors shrink-0">
                        <Filter size={16} />
                    </button>
                </div>
            </div>

            {/* Main Ledger Table */}
            <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-muted border-b border-border text-[10px] font-black uppercase tracking-widest text-secondary">
                            <th className="px-6 py-4">Transaction ID</th>
                            <th className="px-6 py-4">Execution Date</th>
                            <th className="px-6 py-4">Entity / Beneficiary</th>
                            <th className="px-6 py-4">Financial Type</th>
                            <th className="px-6 py-4 text-right">Absolute Amount</th>
                            <th className="px-6 py-4 text-center">Settlement</th>
                            <th className="px-6 py-4 text-right">Audit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50 transition-all group">
                                <td className="px-6 py-4 text-xs font-black text-secondary group-hover:text-primary tabular-nums tracking-tighter">{tx.id}</td>
                                <td className="px-6 py-4 text-xs font-bold tabular-nums text-slate-500">{tx.date}</td>
                                <td className="px-6 py-4">
                                    <div className="text-xs font-black text-primary uppercase tracking-tight">{tx.entity}</div>
                                    <div className="text-[9px] text-secondary mt-0.5 font-bold uppercase opacity-60">Auth Node: {tx.node}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{tx.category}</span>
                                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-sm border w-fit ${tx.type === 'Revenue' ? 'bg-green-50 text-green-700 border-green-100' :
                                                tx.type === 'Expense' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    'bg-slate-50 text-slate-600 border-slate-100'
                                            }`}>{tx.type}</span>
                                    </div>
                                </td>
                                <td className={`px-6 py-4 text-right text-sm font-black tabular-nums ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-primary'}`}>
                                    {tx.amount}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${tx.status === 'Settled' ? 'bg-green-500 text-white' :
                                            tx.status === 'Pending' ? 'bg-orange-500 text-white shadow-sm' :
                                                'bg-red-600 text-white animate-pulse'
                                        }`}>{tx.status}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={`/dashboard/finance/${tx.id}`} className="inline-flex items-center justify-center p-2 rounded-sm text-secondary hover:text-primary hover:bg-muted transition-all">
                                        <ArrowRight size={14} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="bg-slate-50 p-4 border-t border-border flex items-center justify-between">
                    <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Showing 6 / 1,422 Ledger Entries</div>
                    <div className="flex gap-1">
                        {[1, 2, 3, '...', 48].map((p, idx) => (
                            <button key={idx} className={`h-7 w-7 flex items-center justify-center text-[10px] font-bold rounded-sm border ${p === 1 ? 'bg-primary text-white border-primary' : 'bg-white text-secondary border-border hover:bg-muted'}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
