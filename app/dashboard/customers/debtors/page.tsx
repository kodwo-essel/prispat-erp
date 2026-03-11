"use client";

import Link from "next/link";
import {
    ChevronLeft,
    FileText,
    Download,
    Filter,
    Calendar,
    AlertTriangle,
    Mail,
    Printer
} from "lucide-react";

export default function DebtorReportPage() {
    const debtors = [
        { id: "CUST-803", name: "Northern Soils Distribution", balance: "$12,800.00", overdue: "45 Days", risk: "High", contact: "David Chen" },
        { id: "CUST-801", name: "Green Valley Cooperatives", balance: "$4,250.00", overdue: "12 Days", risk: "Low", contact: "Sarah Mensah" },
        { id: "CUST-805", name: "Smallholder Unity Group", balance: "$1,150.00", overdue: "28 Days", risk: "Medium", contact: "Robert Wilson" },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <Link href="/dashboard/customers" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors">
                        <ChevronLeft size={12} /> Back to Registry
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Accounts Receivable & Debtors</h1>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 text-xs font-bold text-secondary border border-border px-4 py-2 rounded-sm hover:bg-slate-50 transition-colors uppercase tracking-wider">
                        <Printer size={14} /> Print Notices
                    </button>
                    <button className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        <Download size={14} /> Export Aging Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Aging Buckets */}
                <div className="bg-white border border-border p-5 rounded-sm shadow-sm flex flex-col gap-4">
                    <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">0-30 Days Aging</div>
                    <div className="text-2xl font-black text-primary">$18.4k</div>
                    <div className="h-1 w-full bg-slate-100 rounded-full">
                        <div className="h-full bg-green-500 w-[70%]" />
                    </div>
                </div>
                <div className="bg-white border border-border p-5 rounded-sm shadow-sm flex flex-col gap-4">
                    <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">31-60 Days Aging</div>
                    <div className="text-2xl font-black text-orange-600">$12.8k</div>
                    <div className="h-1 w-full bg-slate-100 rounded-full">
                        <div className="h-full bg-orange-500 w-[45%]" />
                    </div>
                </div>
                <div className="bg-white border border-border p-5 rounded-sm shadow-sm flex flex-col gap-4">
                    <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">60+ Days (Critical)</div>
                    <div className="text-2xl font-black text-red-600">$16.2k</div>
                    <div className="h-1 w-full bg-slate-100 rounded-full">
                        <div className="h-full bg-red-600 w-[30%]" />
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                <div className="bg-muted px-6 py-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-600" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary">High-Risk Debtor Registry</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                            <select className="bg-white border border-border pl-8 pr-4 py-1.5 rounded-sm text-[10px] font-bold uppercase outline-none">
                                <option>View All Risks</option>
                                <option>High Risk Only</option>
                                <option>Over 60 Days</option>
                            </select>
                        </div>
                    </div>
                </div>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-border text-[10px] text-secondary font-bold uppercase">
                            <th className="px-6 py-3">Client Entity</th>
                            <th className="px-6 py-3">Credit Risk</th>
                            <th className="px-6 py-3">Total Due</th>
                            <th className="px-6 py-3">Days Overdue</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {debtors.map((debtor) => (
                            <tr key={debtor.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-xs font-bold text-primary">{debtor.name}</div>
                                    <div className="text-[10px] text-secondary mt-0.5">{debtor.id} • {debtor.contact}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${debtor.risk === 'High' ? 'bg-red-50 text-red-700 border-red-100' :
                                            debtor.risk === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                'bg-green-50 text-green-700 border-green-100'
                                        }`}>{debtor.risk} Risk</span>
                                </td>
                                <td className="px-6 py-4 font-black text-primary tabular-nums">{debtor.balance}</td>
                                <td className="px-6 py-4 font-bold text-red-600 tabular-nums">{debtor.overdue}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest flex items-center justify-end gap-1 ml-auto">
                                        <Mail size={12} /> Send Demand Notice
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
