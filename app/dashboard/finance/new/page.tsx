"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    Save,
    RotateCcw,
    Coins,
    Building2,
    FileText,
    ArrowRightLeft,
    Calendar,
    AlertCircle,
    Download,
    CheckCircle2
} from "lucide-react";

export default function RecordTransactionPage() {
    const [formData, setFormData] = useState({
        entity: "",
        amount: "",
        type: "Revenue",
        category: "Agro-Input Sales",
        date: new Date().toISOString().split('T')[0],
        description: ""
    });

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href="/dashboard/finance" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors w-fit">
                    <ChevronLeft size={12} /> Back to Ledger
                </Link>
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Record Financial Transaction</h1>
                    <p className="text-secondary text-sm">Official entry for revenues, expenditures, and cross-departmental transfers.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Entry Form */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
                            <Coins size={18} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Transaction Parameters</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Counterparty Entity</label>
                                <div className="relative">
                                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-50" />
                                    <input
                                        type="text"
                                        value={formData.entity}
                                        onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                                        placeholder="e.g. Northern Soils Distribution"
                                        className="w-full bg-muted border border-border px-9 py-2.5 rounded-sm text-sm focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Transaction Type</label>
                                <div className="flex bg-muted p-1 rounded-sm border border-border">
                                    <button
                                        onClick={() => setFormData({ ...formData, type: "Revenue" })}
                                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${formData.type === 'Revenue' ? 'bg-white text-primary shadow-sm rounded-sm' : 'text-secondary hover:text-primary'}`}>
                                        Revenue
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, type: "Expense" })}
                                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${formData.type === 'Expense' ? 'bg-white text-primary shadow-sm rounded-sm' : 'text-secondary hover:text-primary'}`}>
                                        Expense
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Financial Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-muted border border-border px-4 py-2.5 rounded-sm text-sm focus:outline-none focus:border-primary transition-colors">
                                    <option>Agro-Input Sales</option>
                                    <option>Procurement Cost</option>
                                    <option>Logistics Fee</option>
                                    <option>Personnel Payroll</option>
                                    <option>Institutional Tax</option>
                                    <option>Capital Equipment</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Absolute Amount ($)</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full bg-muted border border-border px-4 py-2.5 rounded-sm text-sm font-bold tabular-nums focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Effective Date</label>
                                <div className="relative">
                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-50" />
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-muted border border-border px-9 py-2.5 rounded-sm text-sm focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Audit Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Official record of transaction purpose..."
                                    className="w-full bg-muted border border-border px-4 py-2.5 rounded-sm text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                                />
                            </div>
                        </div>
                    </section>

                    <div className="flex items-center justify-end gap-4 border-t border-border pt-6">
                        <button className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest px-6 py-2.5 rounded-sm hover:bg-muted transition-colors">
                            <RotateCcw size={14} /> Clear Ledger Entry
                        </button>
                        <button className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-8 py-2.5 rounded-sm">
                            <Save size={14} /> Commit to Finance Engine
                        </button>
                    </div>
                </div>

                {/* Live Receipt Preview */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <FileText size={12} /> Institutional Receipt Preview
                    </div>

                    <div className="bg-white border border-border shadow-2xl rounded-sm overflow-hidden flex flex-col relative min-h-[500px] border-t-4 border-t-primary">
                        <div className="p-8 flex flex-col gap-8 flex-grow">
                            {/* Receipt Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <h2 className="text-sm font-black tracking-tighter text-primary">PRISPAT PRIME ERP</h2>
                                    <span className="text-[8px] font-bold text-secondary uppercase">Institutional Logistics Hub</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[8px] font-black text-secondary uppercase">Receipt Serial</span>
                                    <span className="text-[10px] font-bold tabular-nums">#INV-TX-MOCKED</span>
                                </div>
                            </div>

                            {/* Receipt Main Body */}
                            <div className="flex flex-col gap-6 py-8 border-y border-dashed border-border">
                                <div className="flex flex-col gap-2">
                                    <div className="text-[8px] font-black text-secondary uppercase tracking-widest">Invoiced Entity</div>
                                    <div className="text-sm font-bold text-primary underline decoration-primary/20 underline-offset-4 capitalize">
                                        {formData.entity || "DRAFT ENTITY"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-2">
                                        <div className="text-[8px] font-black text-secondary uppercase tracking-widest">Operation Date</div>
                                        <div className="text-xs font-semibold tabular-nums">{formData.date}</div>
                                    </div>
                                    <div className="flex flex-col gap-2 text-right">
                                        <div className="text-[8px] font-black text-secondary uppercase tracking-widest">Service Item</div>
                                        <div className="text-xs font-semibold uppercase">{formData.category}</div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-6 flex flex-col items-center justify-center gap-2 mt-4 rounded-sm border border-slate-100">
                                    <div className="text-[8px] font-black text-secondary uppercase tracking-widest">Total Surcharge (USD)</div>
                                    <div className={`text-4xl font-black tabular-nums tracking-tighter ${formData.type === 'Revenue' ? 'text-green-600' : 'text-primary'}`}>
                                        {formData.type === 'Revenue' ? '+' : '-'}${formData.amount || "0.00"}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 opacity-60">
                                    <div className="text-[8px] font-black text-secondary uppercase tracking-widest">Record Annotation</div>
                                    <p className="text-[10px] font-medium leading-relaxed truncate-3-lines">
                                        {formData.description || "No specific annotation provided for this fiscal entry."}
                                    </p>
                                </div>
                            </div>

                            {/* Receipt Footer */}
                            <div className="flex flex-col items-center gap-4 mt-auto">
                                <div className="flex items-center gap-4 opacity-30 grayscale pointer-events-none">
                                    <div className="h-10 w-10 border border-slate-900 flex items-center justify-center text-[6px] font-bold text-center">STAMP<br />HERE</div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase tracking-widest">Electronic Signature</span>
                                        <span className="text-[10px] font-serif">A. Prispat, Systems Director</span>
                                    </div>
                                </div>
                                <div className="text-[7px] text-center text-secondary uppercase tracking-widest leading-relaxed">
                                    This is a computer-verified institutional record of funds.<br />
                                    Authenticated via NodeSec GH-NODE-01.
                                </div>
                            </div>
                        </div>

                        {/* Action Overlay */}
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none hover:pointer-events-auto">
                            <button className="bg-primary text-white text-[10px] font-bold px-6 py-2.5 rounded-sm flex items-center gap-2 shadow-xl uppercase tracking-widest">
                                <Download size={14} /> Download Sample PDF
                            </button>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-sm flex items-start gap-3">
                        <AlertCircle size={16} className="text-primary mt-0.5 shrink-0" />
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black tracking-widest text-primary uppercase">Fiscal Policy Ref</span>
                            <p className="text-[10px] text-secondary leading-tight">All transactions exceeding $10,000 must be cleared by the Regional Finance Commissioner.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
