"use client";

import { useState, useEffect } from "react";
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
    Filter,
    Loader2,
    Calendar
} from "lucide-react";
import { exportToCSV } from "@/lib/exportUtils";

export default function SupplierAuditPage() {
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchAudits = async () => {
            try {
                const res = await fetch("/api/suppliers/audit");
                const json = await res.json();
                if (json.success) {
                    setAuditLogs(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch audits:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAudits();
    }, []);

    const handleExport = () => {
        if (!auditLogs || auditLogs.length === 0) return;

        const exportData = auditLogs.map(log => ({
            AuditID: log.auditId,
            Supplier: log.supplierId?.name || "Unknown",
            Type: log.type,
            Date: new Date(log.date).toLocaleDateString(),
            Score: `${log.score}/100`,
            Status: log.status,
            ConductedBy: log.conductedBy
        }));
        exportToCSV(exportData, `Supplier_Audit_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const filteredLogs = auditLogs.filter(log =>
        log.auditId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.supplierId?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        avgReliability: auditLogs.length > 0
            ? (auditLogs.reduce((acc, log) => acc + log.score, 0) / auditLogs.length).toFixed(1)
            : "0.0",
        pendingCount: auditLogs.filter(log => log.status === "Conditional").length
    };

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
                <button
                    onClick={handleExport}
                    disabled={auditLogs.length === 0 || loading}
                    className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-sm transition-colors uppercase tracking-wider ${auditLogs.length === 0 || loading
                            ? 'text-slate-400 border-slate-200 border cursor-not-allowed'
                            : 'text-primary border border-primary hover:bg-primary/5'
                        }`}
                >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    Export Audit Registry
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Performance Metrics */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-border p-6 rounded-sm shadow-sm flex items-center justify-between">
                            <div>
                                <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Network Reliability Avg</div>
                                <div className="text-3xl font-bold text-primary mt-2">{stats.avgReliability}%</div>
                                <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold mt-1">
                                    <TrendingUp size={12} /> Syncing live data
                                </div>
                            </div>
                            <BarChart3 size={32} className="text-primary opacity-20" />
                        </div>
                        <div className="bg-white border border-border p-6 rounded-sm shadow-sm flex items-center justify-between">
                            <div>
                                <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Conditional Evaluations</div>
                                <div className="text-3xl font-bold text-orange-600 mt-2">{stats.pendingCount} Items</div>
                                <div className="text-[10px] text-secondary font-medium mt-1">Requiring active follow-up</div>
                            </div>
                            <AlertCircle size={32} className="text-orange-600 opacity-20" />
                        </div>
                    </div>

                    {/* Audit History Table */}
                    <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden min-h-[300px] flex flex-col">
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

                        {loading ? (
                            <div className="flex-grow flex flex-col items-center justify-center gap-4 text-slate-400 p-20">
                                <Loader2 size={32} className="animate-spin text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Accessing Audit Registry...</span>
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="flex-grow flex flex-col items-center justify-center gap-4 text-slate-400 p-20">
                                <Calendar size={48} className="opacity-10" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">No audit records found.</span>
                            </div>
                        ) : (
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
                                    {filteredLogs.map((log) => (
                                        <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-[11px] font-bold text-secondary tabular-nums">{log.auditId}</td>
                                            <td className="px-6 py-4 font-bold text-primary uppercase">{log.supplierId?.name || "Unknown"}</td>
                                            <td className="px-6 py-4 text-[10px] font-bold text-secondary uppercase">{log.type}</td>
                                            <td className="px-6 py-4 text-[11px] text-secondary tabular-nums">{new Date(log.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-black ${log.score >= 80 ? 'text-green-600' : 'text-orange-600'}`}>{log.score}/100</span>
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
                        )}
                    </div>
                </div>

                {/* Audit Protocols & Compliance */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white border border-border p-6 rounded-sm shadow-sm">
                        <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                            <ShieldCheck size={18} className="text-primary" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">Audit Protocols</h3>
                        </div>
                        <ul className="flex flex-col gap-4">
                            {[
                                { title: "Physical Verification", desc: "Site visit and stock count" },
                                { title: "Chemical Lab Test", desc: "Batch composition purity test" },
                                { title: "Financial Health", desc: "Credit & liability assessment" },
                                { title: "LOD Registration", desc: "Letter of Distribution validity" },
                            ].map((p, idx) => (
                                <li key={idx} className="flex flex-col gap-1 border-l-2 border-primary/20 pl-3">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">0{idx + 1}. {p.title}</span>
                                    <span className="text-[10px] text-secondary">{p.desc}</span>
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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="w-full btn-primary text-[10px] py-2 uppercase font-black">Search Records</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
