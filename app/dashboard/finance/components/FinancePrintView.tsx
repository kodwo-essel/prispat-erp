"use client";

import { useState, useEffect } from "react";
import { Leaf, DollarSign, Calendar, MapPin, Building2, ShieldCheck } from "lucide-react";

interface FinancePrintViewProps {
    transaction: any;
    onClose: () => void;
}

export default function FinancePrintView({ transaction, onClose }: FinancePrintViewProps) {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        fetch("/api/settings")
            .then(res => res.json())
            .then(json => {
                if (json.success) setSettings(json.data);
            });
    }, []);

    const biz = settings || {
        organizationName: "Prispat Prime Distribution",
        address: "Plot 42, Industrial Area, Kumasi, Ghana",
        email: "admin@prispat.com",
        phone: "+233 24 000 0000"
    };

    return (
        <div className="fixed inset-0 bg-white z-[100] overflow-y-auto p-12 print:p-0">
            <div className="max-w-4xl mx-auto flex flex-col gap-10">
                {/* Header Section */}
                <div className="flex justify-between items-start border-b-2 border-primary pb-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary text-white flex items-center justify-center rounded-sm">
                                <Leaf size={24} />
                            </div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter text-primary">{biz.organizationName}</h1>
                        </div>
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] flex flex-col gap-1">
                            <div className="flex items-center gap-2"><MapPin size={10} /> {biz.address}</div>
                            <div>Contact: {biz.phone} | {biz.email}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-black text-slate-200 uppercase tracking-tighter mb-2">PAYMENT VOUCHER</h2>
                        <div className="text-sm font-bold text-primary font-mono">{transaction.txId || transaction._id}</div>
                        <div className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-1">Transaction Reference</div>
                    </div>
                </div>

                {/* Transaction Summary */}
                <div className="grid grid-cols-2 gap-12 bg-slate-50 p-8 rounded-sm border border-slate-100">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary">
                            <Building2 size={14} className="text-primary" /> Counterparty
                        </div>
                        <div className="pl-6">
                            <div className="text-lg font-bold text-primary">{transaction.entity}</div>
                            <div className="text-[10px] text-secondary uppercase font-bold tracking-tight">{transaction.category}</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 border-l border-slate-200 pl-12">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary">
                            <Calendar size={14} className="text-primary" /> Transaction Date
                        </div>
                        <div className="pl-6">
                            <div className="text-lg font-bold text-slate-700">
                                {(() => {
                                    const d = transaction.date || transaction.createdAt;
                                    const parsed = d ? new Date(d) : new Date();
                                    return isNaN(parsed.getTime())
                                        ? new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
                                        : parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
                                })()}
                            </div>
                            <div className="text-[10px] text-secondary uppercase font-bold tracking-tight">
                                Method: {transaction.method}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="flex flex-col gap-6">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary border-b border-border pb-2">Voucher Details</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold uppercase text-secondary">Description of Transaction</span>
                            <p className="text-sm font-medium text-primary leading-relaxed">{transaction.description}</p>
                        </div>
                        <div className="flex flex-col gap-2 bg-primary/5 p-6 rounded-sm border border-primary/10 items-center justify-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Settlement Value</span>
                            <div className="text-4xl font-black text-primary tabular-nums tracking-tighter">₵{transaction.amount?.toLocaleString()}</div>
                            <div className="text-[10px] font-bold uppercase text-primary mt-1">{transaction.type} Flow</div>
                        </div>
                    </div>
                </div>

                {/* Audit Section */}
                <div className="grid grid-cols-2 gap-20 mt-20">
                    <div className="flex flex-col gap-8">
                        <div className="h-px bg-slate-300 w-full" />
                        <div className="text-center text-[10px] font-bold text-secondary uppercase tracking-widest">Recipient Signature</div>
                    </div>
                    <div className="flex flex-col gap-8">
                        <div className="h-px bg-slate-300 w-full" />
                        <div className="text-center text-[10px] font-bold text-secondary uppercase tracking-widest">Finance Manager Authorization</div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-12 text-[9px] text-slate-400 italic text-center max-w-2xl mx-auto">
                    This document is an official financial record of Prispat Prime Distribution.
                    All transactions are audited for compliance with standard accounting principles.
                </div>

                {/* Print Controls (Hidden on Print) */}
                <div className="fixed bottom-8 right-8 flex gap-4 print:hidden">
                    <button
                        onClick={() => {
                            if (window.opener) {
                                window.close();
                            } else {
                                onClose();
                            }
                        }}
                        className="bg-slate-800 text-white px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl"
                    >
                        Back to ERP
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="bg-primary text-white px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
                    >
                        Print Voucher / Export PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
