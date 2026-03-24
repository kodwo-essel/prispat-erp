"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    Truck,
    Calendar,
    Package,
    Printer,
    Download,
    FileText,
    History,
    Loader2,
    DollarSign,
    MapPin,
    ArrowRight,
    Trash2
} from "lucide-react";
import ReceiptPrintView from "../components/ReceiptPrintView";
import ConfirmationModal from "@/app/dashboard/components/ConfirmationModal";
import { useRouter } from "next/navigation";

export default function SupplyReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [receipt, setReceipt] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [error, setError] = useState("");

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            const res = await fetch(`/api/supplies/receipts/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) {
                router.push("/dashboard/suppliers/supplies");
            } else {
                setError(json.error || "Failed to delete receipt");
                setTimeout(() => setError(""), 5000);
            }
        } catch (error) {
            console.error("Delete failed:", error);
            setError("A critical system error occurred during deletion.");
            setTimeout(() => setError(""), 5000);
        } finally {
            setDeleteLoading(false);
            setIsDeleteModalOpen(false);
        }
    };

    useEffect(() => {
        const fetchReceipt = async () => {
            try {
                const res = await fetch(`/api/supplies/receipts/${id}`);
                const json = await res.json();
                if (json.success) {
                    setReceipt(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch receipt:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReceipt();
    }, [id]);

    if (loading) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-400">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Loading Shipment Details...</span>
            </div>
        );
    }

    if (!receipt) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <h1 className="text-xl font-bold text-primary">Receipt Not Found</h1>
                <Link href="/dashboard/suppliers/supplies" className="text-xs font-bold text-secondary hover:text-primary uppercase tracking-widest">Return to Registry</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <Link href="/dashboard/suppliers/supplies" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors w-fit">
                        <ChevronLeft size={12} /> Back to Registry
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-primary/10 text-primary rounded-sm flex items-center justify-center">
                            <Truck size={24} />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold tracking-tight text-primary">Receipt {receipt.receiptNumber}</h1>
                            <p className="text-secondary text-xs font-medium">Logistics Event • {receipt.status}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="flex items-center gap-2 text-xs font-bold text-red-600 border border-red-100 px-4 py-2 rounded-sm hover:bg-red-50 transition-colors uppercase tracking-wider"
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                    <button
                        onClick={() => window.open(`/print/supply-receipt/${id}`, '_blank')}
                        className="flex items-center gap-2 text-xs font-bold text-secondary border border-border px-4 py-2 rounded-sm hover:bg-slate-50 transition-colors uppercase tracking-wider"
                    >
                        <Printer size={14} /> Print
                    </button>
                    <button
                        onClick={() => window.open(`/print/supply-receipt/${id}`, '_blank')}
                        className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-6"
                    >
                        <Download size={14} /> Download PDF
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-widest p-4 rounded-sm animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Metadata Card */}
                    <div className="bg-white border border-border rounded-sm shadow-sm p-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 h-1 w-full bg-primary" />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Vendor / Supplier</span>
                                <span className="text-sm font-bold text-primary">{receipt.supplier}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Arrival Timestamp</span>
                                <span className="text-sm font-bold text-primary">{new Date(receipt.arrivalDate).toLocaleDateString()}</span>
                                <span className="text-[10px] text-secondary tabular-nums">{new Date(receipt.arrivalDate).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-secondary uppercase tracking-widest">System Status</span>
                                <span className="text-xs font-black uppercase text-secondary bg-muted px-2 py-0.5 rounded-sm w-fit border border-border">{receipt.status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Table of Items */}
                    <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                                <Package size={16} /> Manifest Details
                            </div>
                            <span className="text-[10px] font-bold text-secondary uppercase">{receipt.items.length} Distinct SKUs</span>
                        </div>
                        <table className="w-full text-left text-xs border-collapse font-medium">
                            <thead>
                                <tr className="border-b border-border bg-slate-50/50">
                                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Product / SKU</th>
                                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Batch/Expiry</th>
                                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Qty</th>
                                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {receipt.items.map((item: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-primary">{item.name}</div>
                                            <div className="text-[9px] text-secondary font-mono bg-slate-100 w-fit px-1.5 rounded-sm mt-0.5">{item.sku}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[10px] font-bold text-slate-700">Batch: {item.batchId}</div>
                                            <div className="text-[9px] text-secondary">Exp: {new Date(item.expiryDate).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-black text-primary tabular-nums">{item.quantity} {item.unit}</div>
                                            <div className="text-[9px] text-secondary uppercase">@ ₵{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-black text-primary tabular-nums">₵{(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                            <Link
                                                href={`/dashboard/inventory/lookup?sku=${item.sku}&batchId=${item.batchId}`}
                                                className="text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                                            >
                                                Track Asset <ArrowRight size={8} className="inline ml-1" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-muted p-6 rounded-sm border border-border border-dashed">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2 flex items-center gap-2">
                            <FileText size={12} /> Shipment Notes
                        </h3>
                        <p className="text-xs text-secondary italic font-medium">"{receipt.notes}"</p>
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="flex flex-col gap-6">
                    <div className="bg-primary text-white p-8 rounded-sm shadow-lg flex flex-col items-center text-center gap-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Financial Settlement</span>
                        <div className="text-4xl font-black tabular-nums tracking-tighter">₵{receipt.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="h-px w-12 bg-white/20" />
                        <p className="text-[10px] font-medium text-white/60 leading-relaxed uppercase tracking-widest">
                            Total Batch Valuation Based on Invoiced Rates
                        </p>
                    </div>

                    <div className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary border-b border-border pb-3">Audit Log</h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-3">
                                <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-primary">Receipt Finalized</span>
                                    <span className="text-[9px] text-secondary">Logged via System Interface</span>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-2 w-2 rounded-full bg-slate-300 mt-1.5" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-500">Inventory Sync Complete</span>
                                    <span className="text-[9px] text-secondary">Asset balances updated per batch</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="flex flex-col items-center gap-1.5 bg-muted border border-border border-dashed py-4 rounded-sm hover:bg-slate-50 transition-colors group">
                        <History size={16} className="text-secondary group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary group-hover:text-primary transition-colors">Contest Discrepancy</span>
                    </button>
                </div>
            </div>


            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                isLoading={deleteLoading}
                title="REVERT LOGISTICS EVENT"
                message={`Are you sure you want to delete receipt ${receipt.receiptNumber}? This will revert all associated inventory counts and audit trails. This action cannot be undone if stock has already been dispatched.`}
                confirmText="Revert & Delete"
            />
        </div>
    );
}
