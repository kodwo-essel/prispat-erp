"use client";

import { use } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    Download,
    Printer,
    Building2,
    Calendar,
    Clock,
    UserCheck,
    ShieldCheck,
    FileText,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    History,
    Lock
} from "lucide-react";

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    // Mock specific transaction data
    const tx = {
        id: id,
        entity: "Green Valley Co-operatives",
        type: "Revenue",
        category: "Agro-Input Sales",
        amount: "$4,250.00",
        date: "2026-03-11",
        time: "10:42:15 AM",
        status: "Settled",
        recordedBy: "Officer James Doe",
        department: "Sales & CRM Division",
        node: "GH-ACCRA-DIST-01",
        method: "Bank Transfer (Interbank)",
        description: "Bulk distribution of 480SL Glyphosate and NPK 15-15-15 fertilizers for the Q2 planting season."
    };

    const auditTrail = [
        { action: "Transaction Initiated", by: "Elena Gilbert", time: "2026-03-11 09:12 AM" },
        { action: "Credit Approval Clearance", by: "Automatic Engine", time: "2026-03-11 09:15 AM" },
        { action: "Final Fiscal Settlement", by: "Officer James Doe", time: "2026-03-11 10:42 AM" },
    ];

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <Link href="/dashboard/finance" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors">
                        <ChevronLeft size={12} /> Back to Ledger
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-primary text-white rounded-sm flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-primary/10">
                            TX
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tighter text-primary">Record {tx.id}</h1>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 uppercase tracking-widest">FISCAL SETTLED</span>
                            </div>
                            <p className="text-secondary text-sm font-medium mt-1">Institutional Revenue • Logged via {tx.node}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 text-xs font-bold text-secondary border border-border px-4 py-2 rounded-sm hover:bg-slate-50 transition-colors uppercase tracking-wider">
                        <Printer size={14} /> Print Receipt
                    </button>
                    <button className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-6">
                        <Download size={14} /> Download PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left: Summary & Metadata */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <div className="bg-white border border-border rounded-sm shadow-sm p-8 flex flex-col gap-8 border-t-4 border-t-primary">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[9px] font-black text-secondary uppercase tracking-widest flex items-center gap-1.5">
                                        <Building2 size={12} className="opacity-50" /> Counterparty Entity
                                    </span>
                                    <span className="text-lg font-bold text-primary">{tx.entity}</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[9px] font-black text-secondary uppercase tracking-widest flex items-center gap-1.5">
                                        <FileText size={12} className="opacity-50" /> Transaction Category
                                    </span>
                                    <span className="text-sm font-bold border-l-2 border-primary pl-3 py-0.5 uppercase tracking-tighter">{tx.category}</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[9px] font-black text-secondary uppercase tracking-widest flex items-center gap-1.5">
                                        <DollarSign size={12} className="opacity-50" /> Payment Protocol
                                    </span>
                                    <span className="text-sm font-black text-slate-700">{tx.method}</span>
                                </div>
                            </div>

                            <div className="bg-slate-900 text-white rounded-sm p-8 flex flex-col items-center justify-center gap-3 shadow-inner relative overflow-hidden group">
                                <div className="absolute top-2 right-2 opacity-10 rotate-12 transition-transform group-hover:rotate-0">
                                    <DollarSign size={100} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Absolute Value (USD)</span>
                                <div className="text-5xl font-black tabular-nums tracking-tighter text-primary">{tx.amount}</div>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <ArrowUpRight size={14} className="text-green-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Revenue Inflow</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 py-6 border-t border-dashed border-border">
                            <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Fiscal Annotation</span>
                            <p className="text-xs leading-relaxed text-secondary font-medium italic italic-serif">
                                "{tx.description}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-border">
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black text-secondary uppercase opacity-60">Record ID</span>
                                <span className="text-[10px] font-black tabular-nums">{tx.id}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black text-secondary uppercase opacity-60">Fiscal Date</span>
                                <span className="text-[10px] font-black tabular-nums">{tx.date}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black text-secondary uppercase opacity-60">Entry Time</span>
                                <span className="text-[10px] font-black tabular-nums">{tx.time}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black text-secondary uppercase opacity-60">Auth Region</span>
                                <span className="text-[10px] font-black uppercase">{tx.node.split('-')[1]}</span>
                            </div>
                        </div>
                    </div>

                    {/* Audit Trail */}
                    <section className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History size={16} className="text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Fiscal Audit Ledger</h3>
                            </div>
                            <ShieldCheck size={16} className="text-green-600" />
                        </div>
                        <div className="divide-y divide-border">
                            {auditTrail.map((audit, idx) => (
                                <div key={idx} className="px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold text-primary">{audit.action}</span>
                                        <span className="text-[10px] text-secondary font-medium">Recorded by: {audit.by}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock size={12} />
                                        <span className="text-[10px] font-bold tabular-nums">{audit.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right: Security & Context */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <section className="bg-slate-900 text-white p-6 rounded-sm shadow-lg flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                            <UserCheck size={18} className="text-primary" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/80">Authorized Registrar</h3>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center font-black text-xs">JD</div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold">{tx.recordedBy}</span>
                                    <span className="text-[10px] font-medium text-white/40">{tx.department}</span>
                                </div>
                            </div>
                            <div className="p-3 bg-primary/10 border border-primary/20 rounded-sm">
                                <div className="flex items-center gap-2 text-primary mb-1">
                                    <Lock size={12} />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Digital Stamp Verified</span>
                                </div>
                                <p className="text-[9px] text-white/60 leading-tight">This transaction has been cryptographically signed by the registrar's private node key.</p>
                            </div>
                        </div>
                    </section>

                    <div className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">Fiscal Compliance Check</div>
                        <ul className="flex flex-col gap-4">
                            <li className="flex items-start gap-3">
                                <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                                    <ShieldCheck size={10} className="text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-primary uppercase">Tax Protocol 01-A</span>
                                    <span className="text-[9px] text-secondary">Verified by National Sales Registry</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 opacity-60">
                                <div className="h-4 w-4 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                                    <DollarSign size={10} className="text-slate-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-primary uppercase">Currency Calibration</span>
                                    <span className="text-[9px] text-secondary">Locked at Central Bank Market Rate</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <button className="w-full bg-muted border border-border py-4 rounded-sm flex flex-col items-center gap-1 hover:bg-slate-100 transition-all border-dashed group">
                        <History size={20} className="text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary group-hover:text-primary transition-colors">Contest Transaction</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
