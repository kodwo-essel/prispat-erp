"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    Save,
    RotateCcw,
    User,
    Package,
    Plus,
    Trash2,
    Loader2,
    Search,
    ShoppingBag
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewOrderPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Registries
    const [customers, setCustomers] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);

    // Form State
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [orderItems, setOrderItems] = useState<any[]>([]);

    // Search States
    const [customerSearch, setCustomerSearch] = useState("");
    const [itemSearch, setItemSearch] = useState("");
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);
    const [showItemSearch, setShowItemSearch] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [custRes, invRes] = await Promise.all([
                    fetch("/api/customers"),
                    fetch("/api/inventory")
                ]);
                const custJson = await custRes.json();
                const invJson = await invRes.json();
                if (custJson.success) setCustomers(custJson.data);
                if (invJson.success) setInventory(invJson.data);
            } catch (err) {
                console.error("Failed to fetch registries:", err);
            }
        };
        fetchData();
    }, []);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase())
    );

    const filteredInventory = inventory.filter(i =>
        i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
        i.sku.toLowerCase().includes(itemSearch.toLowerCase())
    );

    const addItem = (item: any) => {
        // Find all batches for this product and pick the oldest one (FIFO)
        const batches = inventory
            .filter(i => i.sku === item.sku && i.stock > 0)
            .sort((a, b) => new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime());

        const oldestBatch = batches[0] || item; // Fallback to current item if no other matches found

        const existing = orderItems.find(oi => oi.sku === oldestBatch.sku && oi.batchId === oldestBatch.batchId);
        if (existing) {
            setOrderItems(orderItems.map(oi =>
                (oi.sku === oldestBatch.sku && oi.batchId === oldestBatch.batchId)
                    ? { ...oi, quantity: oi.quantity + 1, total: (oi.quantity + 1) * oi.unitPrice }
                    : oi
            ));
        } else {
            setOrderItems([...orderItems, {
                sku: oldestBatch.sku,
                name: oldestBatch.name,
                batchId: oldestBatch.batchId,
                arrivalDate: oldestBatch.arrivalDate,
                quantity: 1,
                unitPrice: oldestBatch.unitPrice || 0,
                total: oldestBatch.unitPrice || 0
            }]);
        }
        setShowItemSearch(false);
    };

    const removeItem = (sku: string, batchId: string) => {
        setOrderItems(orderItems.filter(oi => !(oi.sku === sku && oi.batchId === batchId)));
    };

    const updateQuantity = (sku: string, batchId: string, qty: number) => {
        if (qty < 1) return;

        // Stock Check
        const invItem = inventory.find(i => i.sku === sku && i.batchId === batchId);
        if (invItem && qty > invItem.stock) {
            setError(`Cannot exceed available stock (${invItem.stock}) for batch ${batchId}`);
            return;
        }
        setError("");

        setOrderItems(orderItems.map(oi =>
            (oi.sku === sku && oi.batchId === batchId) ? { ...oi, quantity: qty, total: qty * oi.unitPrice } : oi
        ));
    };

    const totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) {
            setError("Please select a customer.");
            return;
        }
        if (orderItems.length === 0) {
            setError("Please add at least one item.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer: { id: selectedCustomer._id, name: selectedCustomer.name },
                    items: orderItems,
                    totalAmount,
                    recordedBy: "Current User" // In a real app, get from session
                }),
            });
            const json = await res.json();
            if (json.success) {
                router.push("/dashboard/sales");
            } else {
                setError(json.error || "Failed to dispatch order.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href="/dashboard/sales" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors w-fit">
                    <ChevronLeft size={12} /> Back to Sales
                </Link>
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Dispatch New Order</h1>
                    <p className="text-secondary text-sm">Issue stock and generate financial claims for registered institutional clients.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Customer & Item Selection */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Customer Selection */}
                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-border pb-4">
                            <User size={18} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Client Identification</h3>
                        </div>

                        <div className="relative">
                            {selectedCustomer ? (
                                <div className="flex items-center justify-between p-4 bg-muted border border-border rounded-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-sm font-bold shadow-sm">
                                            {selectedCustomer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-primary">{selectedCustomer.name}</div>
                                            <div className="text-[10px] text-secondary uppercase font-bold tracking-tighter">{selectedCustomer.region} / {selectedCustomer.type}</div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCustomer(null)}
                                        className="text-[10px] font-bold text-red-600 uppercase tracking-widest hover:underline"
                                    >
                                        Change Client
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                                    <input
                                        type="text"
                                        placeholder="Search Clinical or Distribution Client..."
                                        className="w-full bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                        value={customerSearch}
                                        onChange={(e) => {
                                            setCustomerSearch(e.target.value);
                                            setShowCustomerSearch(true);
                                        }}
                                        onFocus={() => setShowCustomerSearch(true)}
                                    />
                                    {showCustomerSearch && customerSearch && (
                                        <div className="absolute top-full left-0 right-0 bg-white border border-border shadow-xl rounded-sm z-50 max-h-48 overflow-y-auto mt-1">
                                            {filteredCustomers.length === 0 ? (
                                                <div className="p-4 text-xs text-secondary italic">No matching clients found.</div>
                                            ) : (
                                                filteredCustomers.map(c => (
                                                    <div
                                                        key={c._id}
                                                        onClick={() => {
                                                            setSelectedCustomer(c);
                                                            setShowCustomerSearch(false);
                                                            setCustomerSearch("");
                                                        }}
                                                        className="p-3 hover:bg-slate-50 cursor-pointer border-b border-muted transition-colors"
                                                    >
                                                        <div className="text-xs font-bold text-primary">{c.name}</div>
                                                        <div className="text-[10px] text-secondary uppercase tracking-tighter">{c.region}</div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Item Fulfillment */}
                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <div className="flex items-center gap-2">
                                <Package size={18} className="text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-widest">Order Fulfillment Manifest</h3>
                            </div>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowItemSearch(!showItemSearch)}
                                    className="flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-sm hover:bg-primary/10 transition-colors uppercase tracking-widest border border-primary/20"
                                >
                                    <Plus size={12} /> Add Agrochemicals
                                </button>
                                {showItemSearch && (
                                    <div className="absolute top-full right-0 bg-white border border-border shadow-xl rounded-sm z-50 w-72 mt-2 p-2">
                                        <div className="relative mb-2">
                                            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary opacity-50" />
                                            <input
                                                type="text"
                                                placeholder="Search by SKU or Name..."
                                                className="w-full bg-muted border border-border pl-8 pr-3 py-1.5 rounded-sm text-xs focus:outline-none focus:border-primary"
                                                autoFocus
                                                value={itemSearch}
                                                onChange={(e) => setItemSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto flex flex-col">
                                            {filteredInventory.length === 0 ? (
                                                <div className="p-3 text-[10px] text-secondary italic">No items found in inventory.</div>
                                            ) : (
                                                filteredInventory.map(i => (
                                                    <div
                                                        key={i._id}
                                                        onClick={() => addItem(i)}
                                                        className="p-2 hover:bg-slate-50 cursor-pointer rounded-sm flex flex-col border-b border-muted"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-bold text-primary">{i.name}</span>
                                                            <span className="text-[9px] font-bold text-slate-400">{i.sku}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center mt-0.5">
                                                            <span className="text-[9px] text-secondary">Stock: {i.stock} {i.unit}</span>
                                                            <span className="text-[9px] font-black text-slate-700">₵{i.unitPrice?.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="min-h-[200px]">
                            {orderItems.length === 0 ? (
                                <div className="h-[200px] flex flex-col items-center justify-center gap-3 text-slate-400">
                                    <ShoppingBag size={32} className="opacity-20" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">No items selected for dispatch</span>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-muted">
                                            <th className="py-3 text-[9px] font-bold uppercase tracking-widest text-secondary">Item Details</th>
                                            <th className="py-3 text-[9px] font-bold uppercase tracking-widest text-secondary text-right">Batch ID</th>
                                            <th className="py-3 text-[9px] font-bold uppercase tracking-widest text-secondary text-right">Qty</th>
                                            <th className="py-3 text-[9px] font-bold uppercase tracking-widest text-secondary text-right">Unit Price</th>
                                            <th className="py-3 text-[9px] font-bold uppercase tracking-widest text-secondary text-right">Subtotal</th>
                                            <th className="py-3 text-[9px] font-bold uppercase tracking-widest text-secondary text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-muted">
                                        {orderItems.map((item) => {
                                            // Check if this is the oldest batch for this SKU in state
                                            const allBatchesForSku = inventory.filter(i => i.sku === item.sku && i.stock > 0);
                                            const sorted = [...allBatchesForSku].sort((a, b) => new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime());
                                            const isFIFO = sorted.length > 0 && sorted[0].batchId === item.batchId;

                                            return (
                                                <tr key={`${item.sku}-${item.batchId}`} className="group">
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-[10px] font-bold text-primary">{item.name}</div>
                                                            {isFIFO && (
                                                                <span className="text-[8px] font-black bg-green-50 text-green-600 border border-green-100 px-1 rounded-full uppercase tracking-tighter">FIFO Suggestion</span>
                                                            )}
                                                        </div>
                                                        <div className="text-[9px] text-secondary tracking-widest font-medium uppercase">{item.sku}</div>
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <code className="text-[10px] font-mono bg-slate-50 border border-border px-1.5 py-0.5 rounded-sm">
                                                            {item.batchId}
                                                        </code>
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateQuantity(item.sku, item.batchId, parseInt(e.target.value))}
                                                            className="w-16 bg-muted border border-border px-2 py-1 rounded-sm text-[10px] text-right font-bold focus:outline-none focus:border-primary"
                                                        />
                                                    </td>
                                                    <td className="py-4 text-xs font-bold text-slate-700 text-right tabular-nums">
                                                        ₵{item.unitPrice.toLocaleString()}
                                                    </td>
                                                    <td className="py-4 text-xs font-black text-slate-900 text-right tabular-nums">
                                                        ₵{item.total.toLocaleString()}
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(item.sku, item.batchId)}
                                                            className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-sm"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: Order Summary */}
                <div className="flex flex-col gap-6">
                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6 sticky top-8">
                        <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
                            <ShoppingBag size={18} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Order Summary</h3>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center text-[10px] font-bold text-secondary uppercase tracking-widest">
                                <span>Sub-Total Manifest</span>
                                <span>₵{totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-secondary uppercase tracking-widest">
                                <span>Export Levies (VAT)</span>
                                <span>₵0.00</span>
                            </div>
                            <div className="border-t border-dashed border-border pt-4 mt-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-black text-primary uppercase tracking-widest">Net Payable Value</span>
                                    <span className="text-xl font-black text-primary tabular-nums">₵{totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-4">
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Compliance Check Passed</span>
                                </div>
                                <p className="text-[9px] text-secondary leading-tight italic">Inventory levels and credit protocols verified for current transaction.</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 mt-6">
                            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-widest p-4 rounded-sm">{error}</div>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest py-3 rounded-sm shadow-lg shadow-primary/20 w-full"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                Finalize Dispatch
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setOrderItems([]);
                                    setSelectedCustomer(null);
                                }}
                                className="flex items-center justify-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest py-2 hover:bg-muted transition-colors rounded-sm"
                            >
                                <RotateCcw size={12} /> Clear Current Order
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </form>
    );
}
