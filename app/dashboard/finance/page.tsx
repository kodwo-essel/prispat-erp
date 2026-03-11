import {
    FileText,
    Plus,
    TrendingUp,
    TrendingDown,
    Activity,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    Download,
    Clock
} from "lucide-react";

export default function FinancePage() {
    const transactions = [
        { id: "TX-9001", entity: "Green Valley Co-op", type: "Revenue", amount: "+$4,250.00", date: "2026-03-11", status: "Settled" },
        { id: "TX-9002", entity: "AgroGen Hub", type: "Expense", amount: "-$12,400.00", date: "2026-03-10", status: "Pending" },
        { id: "TX-9003", entity: "Northern Soils", type: "A/R", amount: "+$8,500.00", date: "2026-03-10", status: "Overdue" },
        { id: "TX-9004", entity: "National Tax Board", type: "Tax", amount: "-$1,200.00", date: "2026-03-09", status: "Settled" },
        { id: "TX-9005", entity: "Staff Payroll", type: "Payroll", amount: "-$6,800.00", date: "2026-03-01", status: "Settled" },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Finance & Revenue Ledger</h1>
                    <p className="text-sm text-secondary mt-1">Official financial records for distribution revenue, procurement costs, and institutional audits.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 text-xs font-bold text-primary border border-primary px-4 py-2 rounded-sm hover:bg-primary/5 uppercase tracking-wider transition-colors">
                        <Download size={14} /> Monthly Audit Export
                    </button>
                    <button className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider">
                        <Plus size={14} /> Record Transaction
                    </button>
                </div>
            </div>

            {/* Financial Health Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-border p-5 rounded-sm shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Total Revenue (Q1)</div>
                        <div className="text-2xl font-bold text-primary mt-2">$242,500.00</div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold mt-3">
                        <ArrowUpRight size={12} /> ↑ 14% vs Last Quarter
                    </div>
                </div>
                <div className="bg-white border border-border p-5 rounded-sm shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Operating Expenses</div>
                        <div className="text-2xl font-bold text-primary mt-2">$118,420.00</div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-secondary font-medium mt-3">
                        <Activity size={12} /> Efficiency: 48.8%
                    </div>
                </div>
                <div className="bg-white border border-border p-5 rounded-sm shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Net Distribution Margin</div>
                        <div className="text-2xl font-bold text-primary mt-2">22.4%</div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold mt-3">
                        <TrendingUp size={12} /> Within Target Range
                    </div>
                </div>
                <div className="bg-white border border-border p-5 rounded-sm shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Outstanding Receivables</div>
                        <div className="text-2xl font-bold text-red-600 mt-2">$34,800.00</div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-secondary font-medium mt-3">
                        <Clock size={12} /> Average Age: 12 Days
                    </div>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-border rounded-sm shadow-sm overflow-hidden text-sm">
                    <div className="bg-muted px-6 py-4 border-b border-border flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-widest">Recent Financial Operations</h3>
                        <button className="text-[10px] font-bold text-primary uppercase hover:underline">View All</button>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border text-secondary">
                                <th className="px-6 py-3 text-[10px] font-bold uppercase">ID</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase">Entity / Operation</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase">Category</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase">Amount</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {transactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-[11px] font-bold text-secondary tabular-nums">{tx.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-primary">{tx.entity}</div>
                                        <div className="text-[10px] text-secondary tabular-nums">{tx.date}</div>
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-medium text-secondary">{tx.type}</td>
                                    <td className={`px-6 py-4 font-bold tabular-nums ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-primary'}`}>
                                        {tx.amount}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm border uppercase ${tx.status === 'Settled' ? 'bg-green-50 text-green-700 border-green-200' :
                                                tx.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                    'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* P&L Snapshot */}
                <div className="bg-primary text-white p-6 rounded-sm shadow-md flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest opacity-80">P&L Quick Snapshot</h3>
                            <PieChart size={16} className="opacity-60" />
                        </div>
                        <div className="flex flex-col gap-6">
                            <div>
                                <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Gross Inflow</div>
                                <div className="flex items-center gap-2">
                                    <ArrowUpRight size={14} className="text-green-400" />
                                    <div className="text-xl font-bold">$428,000.00</div>
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Total Procurement</div>
                                <div className="flex items-center gap-2">
                                    <ArrowDownRight size={14} className="text-red-400" />
                                    <div className="text-xl font-bold">$302,400.00</div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Net Operating Surplus</div>
                                <div className="text-3xl font-bold text-green-400">$125,600.00</div>
                            </div>
                        </div>
                    </div>
                    <button className="mt-8 w-full bg-white text-primary text-[10px] font-bold py-3 uppercase tracking-widest rounded-sm hover:bg-slate-100 transition-colors">
                        Request Full Performance Report
                    </button>
                </div>
            </div>
        </div>
    );
}
