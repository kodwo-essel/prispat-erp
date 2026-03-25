"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    Truck,
    Search,
    Calendar,
    Package,
    ArrowRight,
    Loader2,
    Plus,
    FileText,
    History,
    Printer,
    Trash2,
    Pencil,
    X,
    ExternalLink,
    DollarSign
} from "lucide-react";
import ReceiptPrintView from "./components/ReceiptPrintView";

export default function SupplyRegistryPage() {
    const [view, setView] = useState<"receipts" | "items">("receipts");
    const [receipts, setReceipts] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingReceipt, setEditingReceipt] = useState<any>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [recRes, itemRes] = await Promise.all([
                fetch("/api/supplies/receipts"),
                fetch("/api/supplies")
            ]);

            const recJson = await recRes.json();
            const itemJson = await itemRes.json();

            if (recJson.success) setReceipts(recJson.data);
            if (itemJson.success) setItems(itemJson.data);
        } catch (error) {
            console.error("Failed to fetch supply data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingReceipt) return;

        setEditLoading(true);
        setEditError("");

        try {
            const res = await fetch(`/api/supplies/receipts/${editingReceipt._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ arrivalDate: editingReceipt.arrivalDate })
            });

            const json = await res.json();
            if (json.success) {
                await fetchData();
                setIsEditModalOpen(false);
                setEditingReceipt(null);
            } else {
                setEditError(json.error || "Failed to update receipt.");
            }
        } catch (err: any) {
            setEditError(err.message || "An unexpected error occurred.");
        } finally {
            setEditLoading(false);
        }
    };

    const filteredReceipts = receipts.filter(r =>
        r.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredItems = items.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.batchId.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href="/dashboard/suppliers" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors w-fit">
                    <ChevronLeft size={12} /> Back to Suppliers
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Supply Audit Registry</h1>
                        <p className="text-secondary text-sm">Comprehensive ledger of all incoming shipments and logistics events.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/dashboard/suppliers/supplies/new" className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider">
                            <Plus size={14} /> Record New Supply
                        </Link>
                    </div>
                </div>
            </div>

            {/* View Toggle & Filters */}
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="bg-muted p-1 rounded-sm flex items-center">
                    <button
                        onClick={() => setView("receipts")}
                        className={`px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${view === "receipts" ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-primary"}`}
                    >
                        Shipment Receipts
                    </button>
                    <button
                        onClick={() => setView("items")}
                        className={`px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${view === "items" ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-primary"}`}
                    >
                        Individual Items
                    </button>
                </div>

                <div className="relative flex-grow bg-white">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                    <input
                        type="text"
                        placeholder={view === "receipts" ? "Search by Receipt # or Supplier..." : "Search by SKU, Product or Supplier..."}
                        className="w-full bg-white border border-border pl-10 pr-4 py-2 rounded-sm text-xs focus:outline-none focus:border-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Registry Table */}
            <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="h-[400px] flex flex-col items-center justify-center gap-4 text-slate-400">
                        <Loader2 size={32} className="animate-spin text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest">Consulting the Ledger...</span>
                    </div>
                ) : (view === "receipts" ? filteredReceipts.length === 0 : filteredItems.length === 0) ? (
                    <div className="h-[400px] flex flex-col items-center justify-center gap-4 text-slate-400">
                        <Package size={48} className="opacity-20" />
                        <span className="text-sm font-medium">No records found for the current selection.</span>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted border-b border-border">
                                {view === "receipts" ? (
                                    <>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Receipt #</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Arrival Date</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Supplier</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Items</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Total Value</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Billing</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Actions</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Arrival Date</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Product / SKU</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Supplier</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Batch ID</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Quantity</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Invoice</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Audit</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {view === "receipts" ? (
                                filteredReceipts.map((r) => (
                                    <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-primary font-mono">{r.receiptNumber}</div>
                                            <div className="text-[10px] text-secondary mt-0.5 uppercase tracking-tighter">Reference ID</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">

                                                {new Date(r.arrivalDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>

                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-semibold text-slate-600">{r.supplier}</div>
                                            <div className="text-[10px] text-secondary uppercase tracking-widest">Authorized Vendor</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-slate-900 tabular-nums">{r.items.length} Products</div>
                                            <div className="text-[9px] text-secondary truncate max-w-[150px]">
                                                {r.items.map((i: any) => i.name).join(", ")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-black text-primary tabular-nums">₵{(r.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                            <div className="text-[10px] text-secondary uppercase">Gross Value</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight border ${r.status === 'Received' || r.status === 'Verified' ? 'bg-green-50 text-green-600 border-green-100' :
                                                r.status === 'Disputed' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    'bg-slate-50 text-slate-500 border-slate-100'
                                                }`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {r.invoiceId ? (
                                                <Link
                                                    href={`/dashboard/invoices/${r.invoiceId}`}
                                                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                                >
                                                    {r.invoiceId.split('-').slice(0, 3).join('-')} <ExternalLink size={10} />
                                                </Link>
                                            ) : (
                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">No Invoice</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">

                                                <Link
                                                    href={`/dashboard/suppliers/supplies/${r._id}`}
                                                    className="text-[9px] font-bold px-2 py-1 rounded-sm uppercase tracking-tight bg-primary text-white hover:bg-primary-dark flex items-center gap-1.5 transition-colors"
                                                >
                                                    <FileText size={10} /> View
                                                </Link>

                                                <button
                                                    onClick={() => {
                                                        const baseDate = r.arrivalDate || r.createdAt;
                                                        const d = new Date(baseDate);
                                                        // Adjust for local timezone to get the correct YYYY-MM-DD
                                                        const offset = d.getTimezoneOffset() * 60000;
                                                        const localDate = new Date(d.getTime() - offset).toISOString().split('T')[0];

                                                        setEditingReceipt({
                                                            ...r,
                                                            arrivalDate: localDate
                                                        });
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="text-[9px] font-bold px-2 py-1 rounded-sm uppercase tracking-tight border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                                                >
                                                    <Pencil size={10} /> Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredItems.map((s) => (
                                    <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold text-slate-700">
                                            {new Date(s.arrivalDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-primary">{s.name}</div>
                                            <div className="text-[10px] text-secondary font-medium tracking-wider">{s.sku}</div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-semibold text-slate-600">{s.supplier}</td>
                                        <td className="px-6 py-4">
                                            <code className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded-sm border border-slate-200">{s.batchId}</code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-black text-slate-900 tabular-nums">+{s.quantity}</div>
                                            <div className="text-[10px] text-secondary">{s.unit}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {s.invoiceId ? (
                                                <Link
                                                    href={`/dashboard/invoices/${s.invoiceId}`}
                                                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:underline hover:text-indigo-600 transition-colors"
                                                >
                                                    {s.invoiceId.split('-').slice(0, 2).join('-')} <ExternalLink size={10} />
                                                </Link>
                                            ) : (
                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">Pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {s.invoiceId && (
                                                    <Link
                                                        href={`/dashboard/finance/new?invoice=${s.invoiceId}&type=Expense&redirect=/dashboard/suppliers/supplies`}
                                                        className="text-[9px] font-bold px-2 py-1 rounded-sm uppercase tracking-tight bg-green-600 text-white hover:bg-green-700 flex items-center gap-1.5 transition-colors"
                                                    >
                                                        <DollarSign size={10} /> Pay
                                                    </Link>
                                                )}
                                                <Link
                                                    href={`/dashboard/inventory/lookup?sku=${s.sku}&batchId=${s.batchId}`}
                                                    className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1"
                                                >
                                                    View <ArrowRight size={10} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Footer Summary */}
            <div className="flex items-center justify-between p-4 bg-slate-100 border border-border rounded-sm">
                <div className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
                    <History size={12} /> Logistics System Log
                </div>
                <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    Total {view === "receipts" ? "Receipts" : "Items"}: {view === "receipts" ? filteredReceipts.length : filteredItems.length}
                </div>
            </div>

            {/* Print View Overlay */}
            {selectedReceipt && (
                <ReceiptPrintView
                    receipt={selectedReceipt}
                    onClose={() => setSelectedReceipt(null)}
                />
            )}

            {/* Edit Modal */}
            {isEditModalOpen && editingReceipt && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-border rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-2">
                                <Pencil size={16} className="text-primary" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Edit Shipment Arrival</h3>
                            </div>
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setEditingReceipt(null);
                                    setEditError("");
                                }}
                                className="text-secondary hover:text-primary transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6 flex flex-col gap-6">
                            <div className="flex flex-col gap-4 p-4 bg-blue-50 border border-blue-100 rounded-sm">
                                <div className="text-[10px] font-bold text-blue-700 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={12} /> Receipt Metadata
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-[9px] text-blue-600/60 font-bold uppercase tracking-tight">Receipt Number</div>
                                        <div className="text-xs font-mono font-bold text-blue-900">{editingReceipt.receiptNumber}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-blue-600/60 font-bold uppercase tracking-tight">Supplier</div>
                                        <div className="text-xs font-bold text-blue-900">{editingReceipt.supplier}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Corrected Arrival Date</label>
                                <div className="relative">
                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-50" />
                                    <input
                                        type="date"
                                        required
                                        value={editingReceipt.arrivalDate}
                                        onChange={(e) => setEditingReceipt({ ...editingReceipt, arrivalDate: e.target.value })}
                                        className="w-full bg-muted border border-border px-9 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <p className="text-[9px] text-secondary">Correcting this date will also update the logistics audit logs for all items in this shipment.</p>
                            </div>

                            {editError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-widest p-4 rounded-sm">
                                    {editError}
                                </div>
                            )}

                            <div className="flex items-center gap-3 pt-4 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingReceipt(null);
                                        setEditError("");
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest text-secondary hover:bg-muted transition-colors border border-border"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className="flex-1 bg-primary text-white px-4 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {editLoading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
