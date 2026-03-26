"use client";

import { useState, useEffect } from "react";
import { Leaf, FileText, Calendar, MapPin, User, ShieldCheck } from "lucide-react";

interface InvoicePrintViewProps {
    invoice: any;
    payments?: any[];
    onClose: () => void;
}

export default function InvoicePrintView({ invoice, payments = [], onClose }: InvoicePrintViewProps) {
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
                            <div>Contact: {biz.phone} | {biz.email}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-black text-slate-200 uppercase tracking-tighter mb-2">TAX INVOICE</h2>
                        <div className="text-sm font-bold text-primary font-mono">{invoice.invoiceId || invoice.txId || invoice._id}</div>
                        <div className="mt-1">
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${invoice.type === 'Revenue' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                {invoice.type || 'Revenue'}
                            </span>
                        </div>
                        <div className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-1">Invoice Reference</div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-12 bg-slate-50 p-8 rounded-sm border border-slate-100">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary">
                            <User size={14} className="text-primary" /> Bill To
                        </div>
                        <div className="pl-6">
                            <div className="text-lg font-bold text-primary">{invoice.entity || invoice.customerName}</div>
                            {invoice.contactPhone || invoice.contactAddress ? (
                                <div className="text-[10px] text-secondary uppercase font-bold tracking-tight">
                                    {invoice.contactPhone && <span>Phone: {invoice.contactPhone}</span>}
                                    {invoice.contactPhone && invoice.contactAddress && <span> | </span>}
                                    {invoice.contactAddress && <span>{invoice.contactAddress}</span>}
                                </div>
                            ) : (
                                <div className="text-[10px] text-secondary uppercase font-bold tracking-tight">Authorized Client</div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 border-l border-slate-200 pl-12">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary">
                            <Calendar size={14} className="text-primary" /> Invoice Date
                        </div>
                        <div className="pl-6">
                            <div className="text-lg font-bold text-slate-700">
                                {(() => {
                                    const d = invoice.date || invoice.createdAt;
                                    const parsed = d ? new Date(d) : new Date();
                                    return isNaN(parsed.getTime())
                                        ? new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
                                        : parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
                                })()}
                            </div>
                            <div className="text-[10px] text-secondary uppercase font-bold tracking-tight text-green-600">
                                Status: {invoice.status || "Settled"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="flex flex-col gap-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary border-b border-border pb-2">Line Items</div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-200">
                                <th className="py-4 text-[10px] font-bold uppercase text-secondary">Description</th>
                                <th className="py-4 text-right text-[10px] font-bold uppercase text-secondary">Quantity</th>
                                <th className="py-4 text-right text-[10px] font-bold uppercase text-secondary">
                                    {invoice.type === "Expense" ? "Supplier Price" : "Unit Price"}
                                </th>
                                <th className="py-4 text-right text-[10px] font-bold uppercase text-secondary">Total (₵)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {invoice.items ? invoice.items.map((item: any, i: number) => (
                                <tr key={i}>
                                    <td className="py-4">
                                        <div className="text-xs font-bold text-primary">{item.name}</div>
                                        <div className="text-[9px] text-secondary font-medium tracking-widest uppercase">{item.sku}</div>
                                    </td>
                                    <td className="py-4 text-right text-xs font-bold text-slate-700">{item.quantity}</td>
                                    <td className="py-4 text-right text-xs font-medium text-slate-600 tabular-nums">
                                        ₵{(invoice.type === "Expense" ? (item.supplierPrice || item.unitPrice || 0) : (item.unitPrice || item.price || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-4 text-right text-xs font-black text-primary tabular-nums">
                                        ₵{(item.quantity * (invoice.type === "Expense" ? (item.supplierPrice || item.unitPrice || 0) : (item.unitPrice || item.price || 0))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td className="py-4 text-xs font-bold text-primary">{invoice.description || "General Service/Supply"}</td>
                                    <td className="py-4 text-right text-xs font-bold text-slate-700">1</td>
                                    <td className="py-4 text-right text-xs font-medium text-slate-600 tabular-nums">₵{invoice.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="py-4 text-right text-xs font-black text-primary tabular-nums">₵{invoice.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Financial Totals */}
                {(() => {
                    const totalPaid = payments
                        .filter((p: any) => p.status === 'Settled')
                        .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
                    const balance = (invoice.amount || 0) - totalPaid;
                    return (
                        <div className="flex flex-col items-end gap-2 border-t-2 border-slate-200 pt-6">
                            <div className="flex justify-between w-64 text-[10px] font-bold text-secondary uppercase">
                                <span>Subtotal:</span>
                                <span className="tabular-nums">₵{invoice.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between w-64 text-[10px] font-bold text-secondary uppercase">
                                <span>Tax (0%):</span>
                                <span className="tabular-nums">₵0.00</span>
                            </div>
                            {totalPaid > 0 && (
                                <div className="flex justify-between w-64 text-[10px] font-bold text-green-600 uppercase">
                                    <span>Total Paid:</span>
                                    <span className="tabular-nums">₵{totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between w-80 text-lg font-black text-primary uppercase tracking-tighter mt-4 bg-primary/5 p-4 rounded-sm border border-primary/10">
                                <span>{balance <= 0 ? 'Total:' : 'Balance Due:'}</span>
                                <span className="tabular-nums font-mono text-2xl">₵{(balance <= 0 ? invoice.amount : balance)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    );
                })()}

                {/* Payment History */}
                {payments.length > 0 && (
                    <div className="flex flex-col gap-4 mt-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-secondary border-b border-border pb-2">
                            <ShieldCheck size={12} /> Payment History
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    <th className="py-2 text-[10px] font-bold uppercase text-secondary">Reference</th>
                                    <th className="py-2 text-[10px] font-bold uppercase text-secondary">Date</th>
                                    <th className="py-2 text-[10px] font-bold uppercase text-secondary">Recorded By</th>
                                    <th className="py-2 text-[10px] font-bold uppercase text-secondary text-center">Status</th>
                                    <th className="py-2 text-right text-[10px] font-bold uppercase text-secondary">Amount (₵)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payments.map((p: any) => (
                                    <tr key={p.txId}>
                                        <td className="py-3 text-[10px] font-mono font-bold text-secondary">{p.txId}</td>
                                        <td className="py-3 text-xs text-slate-700 tabular-nums">{new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                        <td className="py-3 text-xs text-slate-600">{p.recordedBy}</td>
                                        <td className="py-3 text-center">
                                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${p.status === 'Settled' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>{p.status}</span>
                                        </td>
                                        <td className="py-3 text-right text-xs font-black text-primary tabular-nums">₵{Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Validation Section */}
                <div className="grid grid-cols-2 gap-20 mt-20">
                    <div className="flex flex-col gap-8">
                        <div className="h-px bg-slate-300 w-full" />
                        <div className="text-center text-[10px] font-bold text-secondary uppercase tracking-widest">Customer Acknowledgement</div>
                    </div>
                    <div className="flex flex-col gap-8">
                        <div className="h-px bg-slate-300 w-full" />
                        <div className="text-center text-[10px] font-bold text-secondary uppercase tracking-widest">Authorized Signatory</div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-12 text-[9px] text-slate-400 italic text-center max-w-2xl mx-auto">
                    This is a computer-generated document. No signature is required.
                    Thank you for choosing Prispat Prime Distribution.
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
                        Print Invoice / Export PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
