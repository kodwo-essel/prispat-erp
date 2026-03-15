"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    Download,
    Printer,
    Mail,
    Loader2,
    ShieldCheck,
    FileText,
    TrendingUp,
    DollarSign,
    Trash2,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import InvoicePrintView from "../components/InvoicePrintView";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useRouter } from "next/navigation";

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [invRes, setRes] = await Promise.all([
                    fetch(`/api/finance/${id}`),
                    fetch("/api/settings")
                ]);
                const invJson = await invRes.json();
                const setJson = await setRes.json();

                if (invJson.success) setInvoice(invJson.data);
                if (setJson.success) setSettings(setJson.data);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleStatusUpdate = async (newStatus: string) => {
        setUpdateLoading(true);
        setMessage("");
        setError("");
        try {
            // Mapping status to ledger type
            const type = newStatus === "Pending" ? "A/R" : "Revenue";

            const res = await fetch(`/api/finance/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, type }),
            });
            const json = await res.json();
            if (json.success) {
                setMessage(`INVOICE STATUS UPDATED TO: ${newStatus.toUpperCase()}`);
                setInvoice(json.data);
            } else {
                setError(json.error || "FAILED TO UPDATE STATUS.");
            }
        } catch (err) {
            setError("SYSTEM ERROR: UNABLE TO PROCESS UPDATE.");
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleDelete = async () => {
        setUpdateLoading(true);
        try {
            const res = await fetch(`/api/finance/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) {
                router.push("/dashboard/invoices");
            } else {
                setError(json.error || "FAILED TO DELETE RECORD.");
                setShowDeleteModal(false);
            }
        } catch (err) {
            setError("SYSTEM ERROR: UNABLE TO DELETE RECORD.");
            setShowDeleteModal(false);
        } finally {
            setUpdateLoading(false);
        }
    };

    const biz = settings || {
        organizationName: "Prispat Prime Distribution",
        address: "Plot 42, Industrial Area, Kumasi, Ghana",
        phone: "+233 24 000 0000"
    };

    if (loading) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-400">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Generating Invoice View...</span>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <h1 className="text-xl font-bold text-primary">Invoice Not Found</h1>
                <Link href="/dashboard/invoices" className="text-xs font-bold text-secondary hover:text-primary uppercase tracking-widest">Return to Invoices</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Action Bar - Hidden during print */}
            <div className="flex items-center justify-between print:hidden">
                <Link href="/dashboard/invoices" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors">
                    <ChevronLeft size={12} /> Back to Invoices
                </Link>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 text-xs font-bold text-red-600 border border-red-100 px-4 py-2 rounded-sm hover:bg-red-50 transition-colors uppercase tracking-wider"
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                    <button
                        onClick={() => window.open(`/print/invoice/${id}`, '_blank')}
                        className="flex items-center gap-2 text-xs font-bold text-secondary border border-border px-4 py-2 rounded-sm hover:bg-slate-50 transition-colors uppercase tracking-wider"
                    >
                        <Printer size={14} /> Print
                    </button>
                    <button
                        onClick={() => window.open(`/print/invoice/${id}`, '_blank')}
                        className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-6"
                    >
                        <Download size={14} /> Download PDF
                    </button>
                </div>
            </div>

            {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-widest p-3 rounded-sm animate-in fade-in slide-in-from-top-2 flex items-center gap-3">
                    <CheckCircle2 size={14} /> {message}
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-widest p-3 rounded-sm animate-in fade-in shake flex items-center gap-3">
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            {/* Invoice Container */}
            <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden print:border-0 print:shadow-none">
                {/* Invoice Header */}
                <div className="p-10 border-b border-border flex justify-between items-start bg-muted/30">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 bg-primary text-white flex items-center justify-center rounded-sm font-black text-xl">
                                {biz.organizationName?.[0] || 'A'}
                            </div>
                            <span className="text-xl font-black text-primary uppercase tracking-tighter">{biz.organizationName}</span>
                        </div>
                        <div className="text-[10px] text-secondary leading-relaxed font-medium">
                            {biz.address}<br />
                            {biz.phone}
                        </div>
                    </div>
                    <div className="text-right flex flex-col gap-1">
                        <h2 className="text-3xl font-black text-primary uppercase tracking-tighter">Invoice</h2>
                        <span className="text-xs font-bold text-secondary tabular-nums">{invoice.txId || `INV-${invoice._id.substring(0, 8)}`}</span>
                        <div className="mt-4 flex flex-col gap-1">
                            <span className="text-[8px] font-black uppercase text-secondary">Date Issued</span>
                            <span className="text-xs font-bold">{new Date(invoice.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Billing Details */}
                <div className="p-10 grid grid-cols-2 gap-20">
                    <div className="flex flex-col gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Bill To:</span>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-primary uppercase">{invoice.entity}</span>
                            <span className="text-[10px] text-secondary mt-1">Institutional Buyer • Managed Account</span>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="px-10 pb-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-primary/10">
                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-secondary">Description of Service/Goods</th>
                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-secondary text-right">Qty</th>
                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-secondary text-right">Unit Price</th>
                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-secondary text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            <tr>
                                <td className="py-6">
                                    <div className="text-xs font-bold text-primary">{invoice.description || invoice.category || "General Supply Distribution"}</div>
                                    <div className="text-[9px] text-secondary mt-1 uppercase tracking-tight">Fiscal Category: {invoice.category}</div>
                                </td>
                                <td className="py-6 text-xs text-right tabular-nums">1.00</td>
                                <td className="py-6 text-xs text-right tabular-nums">₵{invoice.amount.toLocaleString()}.00</td>
                                <td className="py-6 text-xs text-right font-black text-primary tabular-nums">₵{invoice.amount.toLocaleString()}.00</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className="p-10 bg-muted/30 flex justify-end">
                    <div className="w-full max-w-xs flex flex-col gap-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-secondary uppercase tracking-widest">Subtotal</span>
                            <span className="font-bold tabular-nums">₵{invoice.amount.toLocaleString()}.00</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-secondary uppercase tracking-widest">VAT (0.0%)</span>
                            <span className="font-bold tabular-nums">₵0.00</span>
                        </div>
                        <div className="h-px bg-border my-2" />
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Total Amount</span>
                            <span className="text-xl font-black text-primary tabular-nums">₵{invoice.amount.toLocaleString()}.00</span>
                        </div>
                        <div className="mt-4 p-3 border border-border rounded-sm flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-secondary tracking-widest">Payment Status</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${invoice.status === 'Settled' ? 'text-green-600' : 'text-amber-600'}`}>
                                    {invoice.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    className="flex-grow bg-muted border border-border px-3 py-2 rounded-sm text-[10px] font-bold uppercase focus:outline-none focus:border-primary appearance-none"
                                    value={invoice.status}
                                    onChange={(e) => handleStatusUpdate(e.target.value)}
                                    disabled={updateLoading}
                                >
                                    <option value="Pending">Pending (Invoice)</option>
                                    <option value="Settled">Settled (Paid)</option>
                                    <option value="Overdue">Overdue</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                                {updateLoading && <Loader2 size={14} className="animate-spin text-primary" />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="p-10 border-t border-border flex justify-between items-end">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Notes & Instructions</span>
                        <p className="text-[9px] text-secondary max-w-sm leading-relaxed">
                            Thank you for your business. Please ensure all payments are made within the agreed credit term periods. This invoice is computer-generated and requires no physical signature for institutional clearance.
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-1 opacity-20">
                        <FileText size={40} className="text-primary" />
                        <span className="text-[8px] font-black uppercase text-primary">Official Record</span>
                    </div>
                </div>
            </div>

            {/* Additional Info Cards - Hidden during print */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
                <div className="bg-white border border-border p-6 rounded-sm shadow-sm flex items-start gap-4">
                    <div className="h-10 w-10 bg-primary/5 text-primary flex items-center justify-center rounded-sm shrink-0">
                        <TrendingUp size={18} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Ledger Impact</h4>
                        <p className="text-xs text-secondary mt-1 leading-relaxed">
                            This transaction has been automatically reconciled in the fiscal Ledger and counts towards our Q2 Revenue targets.
                        </p>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="REDACT INVOICE"
                message="ARE YOU SURE YOU WANT TO PERMANENTLY REDACT THIS INVOICE? THIS ACTION IS IRREVERSIBLE AND WILL BE LOGGED IN THE AUDIT TRAIL."
                isLoading={updateLoading}
            />
        </div>
    );
}
