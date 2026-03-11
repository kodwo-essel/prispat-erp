"use client";

import Link from "next/link";
import {
    ChevronLeft,
    Search,
    BarChart3,
    History,
    ShieldCheck,
    AlertCircle,
    TrendingUp,
    Download,
    Filter
} from "lucide-react";

export default function SupplierAuditPage() {
    const auditLogs = [
        { id: "AUD-8821", supplier: "AgroGen Hub", date: "2026-03-01", score: "98/100", status: "Pass", type: "Annual Structural" },
        { id: "AUD-8790", supplier: "BioDirect Solutions", date: "2026-02-15", score: "72/100", status: "Conditional", type: "Random Quality Check" },
        { id: "AUD-8755", supplier: "TerraChem Ltd", date: "2026-01-20", score: "99/100", status: "Pass", type: "New Batch Validation" },
        { id: "AUD-8712", supplier: "Global Pest Control", date: "2026-01-05", score: "95/100", status: "Pass", type: "Annual Structural" },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <Link href="/dashboard/suppliers" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors">
                        <ChevronLeft size={12} /> Back to Directory
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Supplier Performance Audit</h1>
                </div>
                <button className="flex items-center gap-2 text-xs font-bold text-primary border border-primary px-4 py-2 rounded-sm hover:bg-primary/5 uppercase tracking-wider transition-colors">
                    <Download size={14} /> Export Audit Registry
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Performance Metrics */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-border p-6 rounded-sm shadow-sm flex items-center justify-between">
                            <div>
                                <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Network Reliability Avg</div>
                                <div className="text-3xl font-bold text-primary mt-2">94.8%</div>
                                <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold mt-1">
                                    <TrendingUp size={12} /> +1.2% this quarter
                                </div>
                            </div>
                            <BarChart3 size={32} className="text-primary opacity-20" />
                        </div>
                        <div className="bg-white border border-border p-6 rounded-sm shadow-sm flex items-center justify-between">
                            <div>
                                <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Pending Evaluations</div>
                                <div className="text-3xl font-bold text-orange-600 mt-2">12 Items</div>
                                <div className="text-[10px] text-secondary font-medium mt-1">Due before end of Q1</div>
                            </div>
                            <AlertCircle size={32} className="text-orange-600 opacity-20" />
                        </div>
                    </div>

                    {/* Audit History Table */}
                    <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History size={16} className="text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-widest">Historical Performance Ledger</h3>
                            </div>
                            <div className="flex items-center gap-2 group cursor-pointer">
                                <Filter size={14} className="text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Filter Records</span>
                            </div>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border text-[10px] text-secondary font-bold uppercase">
                                    <th className="px-6 py-3">Audit ID</th>
                                    <th className="px-6 py-3">Supplier Entity</th>
                                    <th className="px-6 py-3">Evaluation Type</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Score</th>
                                    <th className="px-6 py-3 text-right">Certificate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {auditLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-[11px] font-bold text-secondary tabular-nums">{log.id}</td>
                                        <td className="px-6 py-4 font-bold text-primary">{log.supplier}</td>
                                        <td className="px-6 py-4 text-xs text-secondary">{log.type}</td>
                                        <td className="px-6 py-4 text-[11px] text-secondary tabular-nums">{log.date}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-black ${parseInt(log.score) > 80 ? 'text-green-600' : 'text-orange-600'}`}>{log.score}</span>
                                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border ${log.status === 'Pass' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                                                    }`}>{log.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">View PDF</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Audit Protocols & Compliance */}
                <div className="flex flex-col gap-6">
                    <div className="bg-slate-900 text-white p-6 rounded-sm shadow-lg">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
                            <ShieldCheck size={18} className="text-primary" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest">Audit Protocols</h3>
                        </div>
                        <ul className="flex flex-col gap-4">
                            {[
                                { title: "Physical Verification", desc: "Site visit and stock count" },
                                { title: "Chemical Lab Test", desc: "Batch composition purity test" },
                                { title: "Financial Health", desc: "Credit & liability assessment" },
                                { title: "LOD Registration", desc: "Letter of Distribution validity" },
                            ].map((p, idx) => (
                                <li key={idx} className="flex flex-col gap-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">0{idx + 1}. {p.title}</span>
                                    <span className="text-[10px] text-white/50">{p.desc}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Search size={16} className="text-secondary" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-secondary">Registry Quick Connect</h3>
                        </div>
                        <input
                            type="text"
                            placeholder="Enter Audit ID or SKU..."
                            className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-xs focus:outline-none focus:border-primary"
                        />
                        <button className="w-full btn-primary text-[10px] py-2 uppercase font-black">Search Records</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
