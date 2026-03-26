"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    ChevronLeft,
    Save,
    FileText,
    Loader2,
    DollarSign,
    Calendar,
    Users,
    Package,
    Trash2,
    Search,
    ShoppingBag,
    ShieldCheck,
    Plus,
    Building2
} from "lucide-react";

function NewInvoiceForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const customerName = searchParams.get("customer");

    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        txId: `INV-${Date.now().toString().slice(-6)}`,
        entity: customerName || "",
        type: "A/R",
        category: "Product Sale",
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        status: "Pending",
        description: "",
        method: "Bank Transfer",
        recordedBy: "",
        items: [] as any[],
        isInvoice: true,
        totalPaid: 0,
        contactPhone: "",
        contactAddress: ""
    });

    const [itemSearch, setItemSearch] = useState("");
    const [showItemSearch, setShowItemSearch] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [custRes, supRes, invRes, authRes] = await Promise.all([
                    fetch("/api/customers"),
                    fetch("/api/suppliers"),
                    fetch("/api/inventory"),
                    fetch("/api/auth/session")
                ]);
                const custJson = await custRes.json();
                const supJson = await supRes.json();
                const invJson = await invRes.json();
                const authJson = await authRes.json();

                if (custJson.success) setCustomers(custJson.data);
                if (supJson.success) setSuppliers(supJson.data);
                if (invJson.success) setInventory(invJson.data);
                if (authJson?.user) {
                    setFormData(prev => ({ ...prev, recordedBy: authJson.user.name }));
                }
            } catch (err) {
                console.error("Failed to fetch required data", err);
            }
        };
        fetchData();
    }, []);

    const filteredInventory = inventory.filter(i =>
        i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
        i.sku.toLowerCase().includes(itemSearch.toLowerCase())
    );

    const addItem = (item: any) => {
        const existing = formData.items.find((oi: any) => oi.sku === item.sku && oi.batchId === item.batchId);
        let newItems;
        if (existing) {
            newItems = formData.items.map((oi: any) =>
                (oi.sku === item.sku && oi.batchId === item.batchId)
                    ? { ...oi, quantity: oi.quantity + 1, total: (oi.quantity + 1) * oi.unitPrice }
                    : oi
            );
        } else {
            newItems = [...formData.items, {
                sku: item.sku,
                name: item.name,
                batchId: item.batchId,
                quantity: 1,
                unitPrice: item.unitPrice || 0,
                total: item.unitPrice || 0
            }];
        }

        const newAmount = newItems.reduce((sum: number, i: any) => sum + i.total, 0);
        setFormData({ ...formData, items: newItems, amount: newAmount });
        setShowItemSearch(false);
    };

    const removeItem = (sku: string, batchId: string) => {
        const newItems = formData.items.filter((oi: any) => !(oi.sku === sku && oi.batchId === batchId));
        const newAmount = newItems.reduce((sum: number, i: any) => sum + i.total, 0);
        setFormData({ ...formData, items: newItems, amount: newAmount });
    };

    const updateQuantity = (sku: string, batchId: string, qty: number) => {
        if (qty < 1) return;
        const newItems = formData.items.map((oi: any) =>
            (oi.sku === sku && oi.batchId === batchId) ? { ...oi, quantity: qty, total: qty * oi.unitPrice } : oi
        );
        const newAmount = newItems.reduce((sum: number, i: any) => sum + i.total, 0);
        setFormData({ ...formData, items: newItems, amount: newAmount });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/finance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const json = await res.json();
            if (json.success) {
                router.push("/dashboard/invoices");
            } else {
                setError(json.error || "Failed to create invoice.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href="/dashboard/invoices" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors w-fit">
                    <ChevronLeft size={12} /> Back to Invoices
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Generate New Invoice</h1>
                        <p className="text-secondary text-sm">Create a professional electronic invoice and log revenue records.</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-sm flex items-center justify-center text-primary">
                        <FileText size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: General Info & Items */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                        <div className="text-xs font-bold uppercase tracking-widest border-b border-border pb-4">Client Information</div>

                        <div className="flex flex-col gap-4 border-b border-border pb-6">
                            <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Transaction Nature</label>
                            <div className="flex bg-muted p-1 rounded-sm border border-border w-fit">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newNature = "Revenue";
                                        setFormData({
                                            ...formData,
                                            type: formData.status === "Pending" ? "A/R" : "Revenue",
                                            category: "Product Sale",
                                            entity: ""
                                        });
                                    }}
                                    className={`px-6 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${formData.type === 'Revenue' || formData.type === 'A/R' ? "bg-white text-primary shadow-sm border border-border" : "text-secondary hover:text-primary"}`}
                                >
                                    Revenue
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: "Expense", category: "Procurement Cost", entity: "" })}
                                    className={`px-6 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${formData.type === 'Expense' ? "bg-white text-primary shadow-sm border border-border" : "text-secondary hover:text-primary"}`}
                                >
                                    Expense
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">
                                    {formData.type === "Revenue" || formData.type === "A/R" ? "Target Customer / Entity" : "Target Supplier / Entity"}
                                </label>
                                <div className="relative">
                                    {formData.type === "Revenue" || formData.type === "A/R" ? <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" /> : <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />}
                                    <input
                                        required
                                        list={formData.type === "Revenue" || formData.type === "A/R" ? "customers-list" : "suppliers-list"}
                                        value={formData.entity}
                                        onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                                        placeholder={formData.type === "Revenue" || formData.type === "A/R" ? "Enter Customer or Third Party..." : "Enter Supplier or Third Party..."}
                                        className="w-full bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-xs focus:outline-none focus:border-primary"
                                    />
                                    <datalist id="customers-list">
                                        {customers.map(c => (
                                            <option key={c._id} value={c.name} />
                                        ))}
                                    </datalist>
                                    <datalist id="suppliers-list">
                                        {suppliers.map(s => (
                                            <option key={s._id} value={s.name} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Invoice Category</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-muted border border-border px-3 py-2 rounded-sm text-xs focus:outline-none focus:border-primary transition-colors"
                                >
                                    {formData.type === "Revenue" || formData.type === "A/R" ? (
                                        <>
                                            <option>Product Sale</option>
                                            <option>Agro-Input Sales</option>
                                            <option>Sales Fulfillment</option>
                                            <option>Consultancy Fee</option>
                                            <option>Other Revenue</option>
                                        </>
                                    ) : (
                                        <>
                                            <option>Procurement Cost</option>
                                            <option>Logistics Fee</option>
                                            <option>Personnel Payroll</option>
                                            <option>Utility Bill</option>
                                            <option>General Expense</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 border-t border-border pt-6 mt-2">
                            <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter italic">Third-Party Contact Information (Optional)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Contact Phone</label>
                                    <input
                                        type="text"
                                        value={formData.contactPhone}
                                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                        placeholder="e.g. +233 24 000 0000"
                                        className="w-full bg-muted border border-border px-3 py-2 rounded-sm text-xs focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Contact Address</label>
                                    <input
                                        type="text"
                                        value={formData.contactAddress}
                                        onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                                        placeholder="e.g. Accra, Ghana"
                                        className="w-full bg-muted border border-border px-3 py-2 rounded-sm text-xs focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Billing Description</label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-muted border border-border px-3 py-2 rounded-sm text-xs min-h-[80px] focus:outline-none focus:border-primary resize-none"
                                placeholder="Service or product details..."
                            />
                        </div>
                    </section>

                    {/* Item Selection */}
                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <div className="flex items-center gap-2">
                                <Package size={18} className="text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-widest">Linked Products (Optional for Inventory Deduction)</h3>
                            </div>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowItemSearch(!showItemSearch)}
                                    className="flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-sm hover:bg-primary/10 transition-colors uppercase tracking-widest border border-primary/20"
                                >
                                    <Plus size={12} /> Add Items
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
                                                <div className="p-3 text-[10px] text-secondary italic">No items found.</div>
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
                                                            <span className="text-[9px] text-secondary">Stock: {i.stock}</span>
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

                        <div className="min-h-[100px]">
                            {formData.items.length === 0 ? (
                                <div className="h-[100px] flex flex-col items-center justify-center gap-2 text-slate-400">
                                    <ShoppingBag size={24} className="opacity-20" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">No items linked to this invoice</span>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-muted">
                                            <th className="py-2 text-[9px] font-bold uppercase tracking-widest text-secondary">Item</th>
                                            <th className="py-2 text-[9px] font-bold uppercase tracking-widest text-secondary text-right">Qty</th>
                                            <th className="py-2 text-[9px] font-bold uppercase tracking-widest text-secondary text-right">Total</th>
                                            <th className="py-2 text-[9px] font-bold uppercase tracking-widest text-secondary text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-muted">
                                        {formData.items.map((item: any) => (
                                            <tr key={`${item.sku}-${item.batchId}`} className="group">
                                                <td className="py-3">
                                                    <div className="text-[10px] font-bold text-primary">{item.name}</div>
                                                    <div className="text-[8px] text-secondary uppercase">{item.sku}</div>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(item.sku, item.batchId, parseInt(e.target.value))}
                                                        className="w-12 bg-muted border border-border px-1 py-0.5 rounded-sm text-[10px] text-right focus:outline-none"
                                                    />
                                                </td>
                                                <td className="py-3 text-xs font-bold text-slate-900 text-right tabular-nums">
                                                    ₵{item.total.toLocaleString()}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <button type="button" onClick={() => removeItem(item.sku, item.batchId)} className="text-red-500 p-1 hover:bg-red-50 rounded-sm">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right: Financials */}
                <div className="flex flex-col gap-6">
                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                        <div className="text-xs font-bold uppercase tracking-widest border-b border-border pb-4">Financial Details</div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Total Amount (₵)</label>
                            <div className="relative">
                                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                                <input
                                    type="number"
                                    required
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                    className="w-full bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-xs focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Issue Date</label>
                            <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-xs focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => {
                                        const newStatus = e.target.value;
                                        const isRevenue = formData.type === "Revenue" || formData.type === "A/R";
                                        setFormData({
                                            ...formData,
                                            status: newStatus,
                                            type: isRevenue ? (newStatus === "Pending" ? "A/R" : "Revenue") : "Expense"
                                        });
                                    }}
                                    className="w-full bg-muted border border-border px-3 py-2 rounded-sm text-xs focus:outline-none focus:border-primary"
                                >
                                    <option value="Pending">Pending (Invoice)</option>
                                    <option value="Settled">Settled (Paid)</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Payment Method</label>
                                <select
                                    value={formData.method}
                                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                                    className="w-full bg-muted border border-border px-3 py-2 rounded-sm text-xs focus:outline-none focus:border-primary"
                                >
                                    <option>Bank Transfer</option>
                                    <option>Cash</option>
                                    <option>Check</option>
                                    <option>Mobile Money</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Final Invoice Value</span>
                                <span className="text-xl font-black text-primary tabular-nums">₵{formData.amount.toLocaleString()}</span>
                            </div>
                            {formData.items.length > 0 && formData.status === "Settled" && (
                                <div className="mt-2 flex items-center gap-1.5 text-[8px] font-bold text-green-600 uppercase">
                                    <ShieldCheck size={10} /> Inventory will be deducted
                                </div>
                            )}
                        </div>
                    </section>

                    {error && <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-widest p-4 rounded-sm">{error}</div>}

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 bg-white border border-border py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn-primary py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Generate Invoice
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default function NewInvoicePage() {
    return (
        <Suspense fallback={
            <div className="flex-grow flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-400">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Initializing...</span>
            </div>
        }>
            <NewInvoiceForm />
        </Suspense>
    );
}
