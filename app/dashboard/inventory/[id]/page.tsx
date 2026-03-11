"use client";

import { use } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    ArrowUpRight,
    ArrowDownRight,
    History,
    Settings,
    ShieldCheck,
    Clock,
    Download,
    Printer,
    ExternalLink,
    Edit3,
    Trash2,
    AlertTriangle,
    FlaskConical,
    BarChart3
} from "lucide-react";

export default function ItemManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    // Mock data for a specific chemical asset
    const item = {
        id: id,
        name: "Glyphosate 480SL",
        category: "Herbicide",
        stock: 1420,
        unit: "Liters",
        hazard: "Level 2",
        status: "In Stock",
        supplier: "AgroGen Hub",
        procurementDate: "2026-01-15",
        expiryDate: "2028-12-01",
        lastAudit: "2026-03-01",
        storageTemp: "15°C - 25°C",
        chemicalComposition: "480g/L Glyphosate as Isopropylamine salt",
    };

    const activityLog = [
        { id: 1, type: "Incoming", qty: "+400 L", entity: "AgroGen Hub", date: "2026-03-10", officer: "J. Doe" },
        { id: 2, type: "Outgoing", qty: "-150 L", entity: "West Province Hub", date: "2026-03-05", officer: "S. Miller" },
        { id: 3, type: "Audit", qty: "Verified", entity: "Internal Audit", date: "2026-03-01", officer: "Audit Team B" },
        { id: 4, type: "Incoming", qty: "+600 L", entity: "TerraChem Ltd", date: "2026-02-20", officer: "J. Doe" },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Top Navigation & Actions */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <Link href="/dashboard/inventory" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors w-fit">
                        <ChevronLeft size={12} /> Back to Registry
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold tracking-tight text-primary">{item.name}</h1>
                        <span className="text-xs bg-muted border border-border px-3 py-1 rounded-sm text-secondary font-bold tabular-nums">ID: {item.id}</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 text-xs font-bold text-secondary border border-border px-4 py-2 rounded-sm hover:bg-slate-50 transition-colors uppercase tracking-wider">
                        <Printer size={14} /> Label Print
                    </button>
                    <button className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        <Edit3 size={14} /> Modify Asset
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Section: Core Stats & Specs */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Current Stock</div>
                            <div className="text-2xl font-bold text-primary tabular-nums">{item.stock} <span className="text-sm font-medium">{item.unit}</span></div>
                            <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[85%]" />
                            </div>
                        </div>
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Hazard Ranking</div>
                            <div className="text-2xl font-bold text-blue-600 uppercase tabular-nums">{item.hazard}</div>
                            <div className="flex items-center gap-1 text-[10px] text-secondary font-medium mt-1">
                                <ShieldCheck size={12} /> Compliance Verified
                            </div>
                        </div>
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Health Status</div>
                            <div className="text-2xl font-bold text-green-600 uppercase tabular-nums">{item.status}</div>
                            <div className="flex items-center gap-1 text-[10px] text-secondary font-medium mt-1">
                                <Clock size={12} /> Expiry in 32 Months
                            </div>
                        </div>
                    </div>

                    <section className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center gap-2">
                            <FlaskConical size={16} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Technical Specifications</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 text-xs">
                                    <span className="text-secondary font-medium">Category:</span>
                                    <span className="text-primary font-bold">{item.category}</span>
                                </div>
                                <div className="grid grid-cols-2 text-xs">
                                    <span className="text-secondary font-medium">Composition:</span>
                                    <span className="text-primary font-bold">{item.chemicalComposition}</span>
                                </div>
                                <div className="grid grid-cols-2 text-xs">
                                    <span className="text-secondary font-medium">Storage Req:</span>
                                    <span className="text-primary font-bold">{item.storageTemp}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 border-l border-border pl-8">
                                <div className="grid grid-cols-2 text-xs">
                                    <span className="text-secondary font-medium">Verified Supplier:</span>
                                    <span className="text-primary font-bold underline cursor-pointer">{item.supplier}</span>
                                </div>
                                <div className="grid grid-cols-2 text-xs">
                                    <span className="text-secondary font-medium">Procured on:</span>
                                    <span className="text-primary font-bold tabular-nums">{item.procurementDate}</span>
                                </div>
                                <div className="grid grid-cols-2 text-xs">
                                    <span className="text-secondary font-medium">National Registry:</span>
                                    <span className="text-primary font-bold flex items-center gap-1">REG-004-92 <ExternalLink size={10} /></span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History size={16} className="text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-widest">Global Asset Ledger</h3>
                            </div>
                            <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">Export Ledger</button>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border text-[10px] text-secondary font-bold uppercase">
                                    <th className="px-6 py-3">Operation</th>
                                    <th className="px-6 py-3">Quantity</th>
                                    <th className="px-6 py-3">Entity / Stakeholder</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Authorized By</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {activityLog.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${log.type === 'Incoming' ? 'bg-green-50 text-green-700' :
                                                    log.type === 'Outgoing' ? 'bg-orange-50 text-orange-700' :
                                                        'bg-blue-50 text-blue-700'
                                                }`}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 font-bold tabular-nums ${log.qty.startsWith('+') ? 'text-green-600' : log.qty.startsWith('-') ? 'text-orange-600' : 'text-primary'}`}>
                                            {log.qty}
                                        </td>
                                        <td className="px-6 py-4 text-secondary font-medium">{log.entity}</td>
                                        <td className="px-6 py-4 text-secondary tabular-nums">{log.date}</td>
                                        <td className="px-6 py-4 text-primary font-bold">{log.officer}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>

                {/* Right Section: Quick Access & Notifications */}
                <div className="flex flex-col gap-6">
                    <div className="bg-primary text-white p-6 rounded-sm shadow-md">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-6">Commander's Actions</h3>
                        <div className="flex flex-col gap-3">
                            <button className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 p-3 rounded-sm text-xs font-bold transition-all group">
                                Schedule Quality Audit
                                <ArrowUpRight size={14} className="opacity-40 group-hover:opacity-100" />
                            </button>
                            <button className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 p-3 rounded-sm text-xs font-bold transition-all group">
                                Internal Inventory Transfer
                                <ArrowUpRight size={14} className="opacity-40 group-hover:opacity-100" />
                            </button>
                            <button className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 p-3 rounded-sm text-xs font-bold transition-all group">
                                Generate Disposal Warrant
                                <ArrowUpRight size={14} className="opacity-40 group-hover:opacity-100" />
                            </button>
                            <div className="h-px bg-white/10 my-2" />
                            <button className="flex items-center gap-2 text-red-300 hover:text-red-200 text-[10px] font-bold uppercase tracking-widest transition-colors">
                                <Trash2 size={12} /> Mark for Decommission
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 size={16} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Stock Health Index</h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between text-[10px] font-bold uppercase text-secondary">
                                    <span>Chemical Stability</span>
                                    <span>92%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full">
                                    <div className="h-full bg-primary w-[92%]" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between text-[10px] font-bold uppercase text-secondary">
                                    <span>Storage Utilization</span>
                                    <span>64%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full">
                                    <div className="h-full bg-blue-400 w-[64%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 p-5 rounded-sm flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-orange-700">
                            <AlertTriangle size={16} />
                            <h3 className="text-xs font-black uppercase tracking-widest">Active System Alert</h3>
                        </div>
                        <p className="text-[11px] text-orange-800 leading-relaxed font-medium">
                            Periodic inspection scheduled for 2026-03-15. Ensure ventilation protocols are active for audit teams.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
