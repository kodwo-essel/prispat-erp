"use client";

import Link from "next/link";
import {
    ChevronLeft,
    ShieldAlert,
    History,
    Search,
    Filter,
    Download,
    Clock,
    Globe,
    Monitor,
    AlertCircle
} from "lucide-react";

export default function AccessAuditPage() {
    const logs = [
        { id: "LOG-901", user: "Officer James Doe", action: "Inventory Export", time: "2026-03-11 10:42 AM", ip: "192.168.1.42", status: "Success", risk: "Low" },
        { id: "LOG-902", user: "Sarah Mensah", action: "Client Credit Override", time: "2026-03-11 09:15 AM", ip: "192.168.2.11", status: "Authorized", risk: "High" },
        { id: "LOG-903", user: "Unknown (Guest)", action: "Login Attempt", time: "2026-03-11 08:30 AM", ip: "45.12.99.102", status: "Failed", risk: "Critical" },
        { id: "LOG-904", user: "Elena Gilbert", action: "Payroll Processing", time: "2026-03-10 04:20 PM", ip: "10.0.0.55", status: "Success", risk: "Medium" },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <Link href="/dashboard/staff" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors">
                        <ChevronLeft size={12} /> Back to Hub
                    </Link>
                    <div className="flex items-center gap-3">
                        <ShieldAlert size={28} className="text-red-600" />
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Security & Access Audit Ledger</h1>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 text-xs font-bold text-secondary border border-border px-4 py-2 rounded-sm hover:bg-slate-50 transition-colors uppercase tracking-wider">
                        <Clock size={14} /> Clear 30D Logs
                    </button>
                    <button className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        <Download size={14} /> Export Forensic Report
                    </button>
                </div>
            </div>

            {/* Security Status Panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-red-50 border border-red-100 p-5 rounded-sm flex flex-col gap-2">
                    <div className="text-[10px] font-black text-red-600 uppercase tracking-widest">Unauthorized Attempts</div>
                    <div className="text-3xl font-black text-red-700">12</div>
                    <div className="text-[9px] font-bold text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={10} /> +2 Since Last Audit
                    </div>
                </div>
                <div className="bg-white border border-border p-5 rounded-sm flex flex-col gap-2">
                    <div className="text-[10px] font-black text-secondary uppercase tracking-widest">Active Sessions</div>
                    <div className="text-3xl font-black text-primary">8</div>
                </div>
                <div className="bg-white border border-border p-5 rounded-sm flex flex-col gap-2">
                    <div className="text-[10px] font-black text-secondary uppercase tracking-widest">Critical Actions (24h)</div>
                    <div className="text-3xl font-black text-orange-600">4</div>
                </div>
                <div className="bg-white border border-border p-5 rounded-sm flex flex-col gap-2">
                    <div className="text-[10px] font-black text-secondary uppercase tracking-widest">System Health</div>
                    <div className="text-3xl font-black text-green-600">99.8%</div>
                </div>
            </div>

            {/* Main Audit Table */}
            <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden mt-2">
                <div className="bg-muted px-6 py-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History size={16} className="text-primary" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Real-Time Access Registry</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                            <input
                                type="text"
                                placeholder="SEARCH USER OR ACTION..."
                                className="bg-white border border-border pl-8 pr-4 py-1.5 rounded-sm text-[10px] font-bold uppercase outline-none w-64"
                            />
                        </div>
                        <button className="bg-white border border-border p-1.5 rounded-sm text-secondary hover:text-primary transition-colors">
                            <Filter size={14} />
                        </button>
                    </div>
                </div>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-border text-[10px] text-secondary font-bold uppercase">
                            <th className="px-6 py-3">Trace ID</th>
                            <th className="px-6 py-3">Authenticated User</th>
                            <th className="px-6 py-3">Action Description</th>
                            <th className="px-6 py-3">Timestamp / IP Node</th>
                            <th className="px-6 py-3 text-right">Risk Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-[10px] font-black tabular-nums text-slate-400">{log.id}</td>
                                <td className="px-6 py-4">
                                    <div className="text-xs font-bold text-primary">{log.user}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-medium text-secondary">{log.action}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="text-[10px] font-bold text-primary flex items-center gap-1">
                                            <Clock size={10} className="text-slate-400" /> {log.time}
                                        </div>
                                        <div className="text-[9px] font-medium text-secondary flex items-center gap-1">
                                            <Globe size={10} className="text-slate-400" /> {log.ip}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border shadow-sm ${log.risk === 'Critical' ? 'bg-red-900 text-white border-red-950' :
                                            log.risk === 'High' ? 'bg-red-100 text-red-700 border-red-200' :
                                                log.risk === 'Medium' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                    'bg-green-100 text-green-700 border-green-200'
                                        }`}>{log.risk}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="bg-slate-50 p-4 border-t border-border flex items-center justify-center">
                    <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-[0.2em]">Load Historical Archives</button>
                </div>
            </div>
        </div>
    );
}
