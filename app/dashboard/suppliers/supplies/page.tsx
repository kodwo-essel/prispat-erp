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
    Printer
} from "lucide-react";
import ReceiptPrintView from "./components/ReceiptPrintView";

export default function SupplyRegistryPage() {
    const [view, setView] = useState<"receipts" | "items">("receipts");
    const [receipts, setReceipts] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch both for comparison or fallback
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

        fetchData();
    }, []);

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
                        <Link href="/dashboard/suppliers/new-receipt" className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider">
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
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Arrival Date</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Product / SKU</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Supplier</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Batch ID</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Quantity</th>
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
                                                <Calendar size={12} className="text-primary opacity-50" />
                                                {new Date(r.arrivalDate).toLocaleDateString()}
                                            </div>
                                            <div className="text-[10px] text-secondary mt-0.5 uppercase tracking-tighter">
                                                {new Date(r.arrivalDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                            <div className="text-xs font-black text-primary tabular-nums">₵{r.totalAmount.toLocaleString()}</div>
                                            <div className="text-[10px] text-secondary uppercase">Gross Value</div>
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedReceipt(r)}
                                                className="text-[9px] font-bold px-2 py-1 rounded-sm uppercase tracking-tight border border-primary text-primary hover:bg-primary/5 flex items-center gap-1.5 transition-colors"
                                            >
                                                <Printer size={10} /> Export
                                            </button>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight border ${r.status === 'Received' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                r.status === 'Verified' ? 'bg-green-50 text-green-600 border-green-100' :
                                                    'bg-slate-50 text-slate-500 border-slate-100'
                                                }`}>
                                                {r.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredItems.map((s) => (
                                    <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold text-slate-700">
                                            {new Date(s.arrivalDate).toLocaleDateString()}
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
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1 ml-auto">
                                                Details <ArrowRight size={10} />
                                            </button>
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
                    <History size={12} /> Authorized System Log: High-Integrity Logistics Interface
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
        </div>
    );
}
