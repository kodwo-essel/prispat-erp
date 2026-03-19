"use client";

import { useState, useEffect } from "react";
import { Leaf, Truck, Calendar, MapPin } from "lucide-react";

interface ReceiptPrintViewProps {
    receipt: any;
    onClose: () => void;
}

export default function ReceiptPrintView({ receipt, onClose }: ReceiptPrintViewProps) {
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
                            <div className="h-12 w-12 bg-white flex items-center justify-center rounded-sm border border-slate-200 overflow-hidden p-1">
                                <img
                                    src={biz.logoUrl || "/images/logo.jpeg"}
                                    alt="Logo"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/images/logo.jpeg";
                                    }}
                                />
                            </div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter text-primary">{biz.organizationName}</h1>
                        </div>
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] flex flex-col gap-1">
                            <div className="flex items-center gap-2"><MapPin size={10} /> {biz.address}</div>
                            <div>Digital Address: {biz.systemNodeId || "[System-ID]"}</div>
                            <div>Contact: {biz.phone} | {biz.email}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-black text-slate-200 uppercase tracking-tighter mb-2">SUPPLY RECEIPT</h2>
                        <div className="text-sm font-bold text-primary font-mono">{receipt.receiptNumber}</div>
                        <div className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-1">Audit Reference ID</div>
                    </div>
                </div>

                {/* Logistics Metadata */}
                <div className="grid grid-cols-2 gap-12 bg-slate-50 p-8 rounded-sm border border-slate-100">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary">
                            <Truck size={14} className="text-primary" /> Verified Supplier
                        </div>
                        <div className="pl-6">
                            <div className="text-lg font-bold text-primary">{receipt.supplier}</div>
                            <div className="text-[10px] text-secondary uppercase font-bold tracking-tight">Authorized Agrochemical Vendor</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 border-l border-slate-200 pl-12">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary">
                            <Calendar size={14} className="text-primary" /> Logistics Event Date
                        </div>
                        <div className="pl-6">
                            <div className="text-lg font-bold text-slate-700">
                                {(() => {
                                    const d = receipt.arrivalDate || receipt.createdAt;
                                    const parsed = d ? new Date(d) : new Date();
                                    return isNaN(parsed.getTime())
                                        ? new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
                                        : parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
                                })()}
                            </div>
                            <div className="text-[10px] text-secondary uppercase font-bold tracking-tight">
                                Arrival Recorded: {(() => {
                                    const d = receipt.arrivalDate || receipt.createdAt;
                                    const parsed = d ? new Date(d) : new Date();
                                    return isNaN(parsed.getTime()) ? "[System Time]" : parsed.toLocaleTimeString();
                                })()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Manifest Table */}
                <div className="flex flex-col gap-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary border-b border-border pb-2">Shipment Manifest</div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-200">
                                <th className="py-4 text-[10px] font-bold uppercase text-secondary">Product / SKU</th>
                                <th className="py-4 text-[10px] font-bold uppercase text-secondary">Batch ID</th>
                                <th className="py-4 text-right text-[10px] font-bold uppercase text-secondary">Quantity</th>
                                <th className="py-4 text-right text-[10px] font-bold uppercase text-secondary">Unit Price</th>
                                <th className="py-4 text-right text-[10px] font-bold uppercase text-secondary">Total (₵)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {receipt.items.map((item: any, i: number) => (
                                <tr key={i}>
                                    <td className="py-4">
                                        <div className="text-xs font-bold text-primary">{item.name}</div>
                                        <div className="text-[9px] text-secondary font-medium tracking-widest uppercase">{item.sku}</div>
                                    </td>
                                    <td className="py-4">
                                        <code className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded-sm">{item.batchId || "N/A"}</code>
                                    </td>
                                    <td className="py-4 text-right text-xs font-bold text-slate-700">{item.quantity} {item.unit}</td>
                                    <td className="py-4 text-right text-xs font-medium text-slate-600 tabular-nums">₵{item.unitPrice.toLocaleString()}</td>
                                    <td className="py-4 text-right text-xs font-black text-primary tabular-nums">₵{(item.quantity * item.unitPrice).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Financial Totals */}
                <div className="flex flex-col items-end gap-2 border-t-2 border-slate-200 pt-6">
                    <div className="flex justify-between w-64 text-[10px] font-bold text-secondary uppercase">
                        <span>Subtotal Manifest:</span>
                        <span className="tabular-nums">₵{receipt.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between w-64 text-[10px] font-bold text-secondary uppercase">
                        <span>Logistics Levies:</span>
                        <span className="tabular-nums">₵0.00</span>
                    </div>
                    <div className="flex justify-between w-80 text-lg font-black text-primary uppercase tracking-tighter mt-4 bg-primary/5 p-4 rounded-sm border border-primary/10">
                        <span>Net Value Received:</span>
                        <span className="tabular-nums font-mono text-2xl">₵{receipt.totalAmount.toLocaleString()}</span>
                    </div>
                </div>

                {/* Validation Section */}
                <div className="grid grid-cols-2 gap-20 mt-20">
                    <div className="flex flex-col gap-8">
                        <div className="h-px bg-slate-300 w-full" />
                        <div className="text-center text-[10px] font-bold text-secondary uppercase tracking-widest">Supplier Representative Signature</div>
                    </div>
                    <div className="flex flex-col gap-8">
                        <div className="h-px bg-slate-300 w-full" />
                        <div className="text-center text-[10px] font-bold text-secondary uppercase tracking-widest">Warehouse Manager Authorization</div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-12 text-[9px] text-slate-400 italic text-center max-w-2xl mx-auto">
                    This document serves as an official proof of logistics receipt within the Prispat Prime ERP ecosystem.
                    All items listed have been physically inspected and reconciled against the vendor manifesto.
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
                        Back to Registry
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="bg-primary text-white px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
                    >
                        Print Receipt / Export PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
