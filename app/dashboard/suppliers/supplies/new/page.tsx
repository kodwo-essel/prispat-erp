"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ChevronLeft,
    Plus,
    Trash2,
    Save,
    RotateCcw,
    Truck,
    Calendar,
    Package,
    Loader2,
    DollarSign,
    Search
} from "lucide-react";
import AssetSelectorModal from "@/app/dashboard/components/AssetSelectorModal";

interface ReceiptItem {
    name: string;
    sku: string;
    category: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    supplierPrice: number;
    batchId: string;
    expiryDate: string;
    hazardClass: string;
}

export default function NewSupplyReceiptPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
        supplier: "",
        arrivalDate: new Date().toISOString().split('T')[0],
        items: [] as ReceiptItem[],
        notes: ""
    });

    const [inventory, setInventory] = useState<any[]>([]);
    const [showAssetModal, setShowAssetModal] = useState(false);
    const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [supRes, invRes] = await Promise.all([
                    fetch("/api/suppliers"),
                    fetch("/api/inventory")
                ]);
                const supJson = await supRes.json();
                const invJson = await invRes.json();

                if (supJson.success) setSuppliers(supJson.data);
                if (invJson.success) setInventory(invJson.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        };
        fetchData();
    }, []);

    const addItem = () => {
        const newItem: ReceiptItem = {
            name: "",
            sku: "",
            category: "General",
            quantity: 1,
            unit: "Liters",
            unitPrice: 0,
            supplierPrice: 0,
            batchId: "",
            expiryDate: "",
            hazardClass: "None"
        };
        setFormData({ ...formData, items: [...formData.items, newItem] });
    };

    const handleProductSelect = (index: number, item: any) => {
        const newItems = [...formData.items];
        newItems[index] = {
            ...newItems[index],
            name: item.name,
            sku: item.sku,
            category: item.category,
            unit: item.unit,
            unitPrice: item.unitPrice || 0,
            supplierPrice: item.supplierPrice || 0,
            hazardClass: item.hazardClass || "None",
        };
        setFormData({ ...formData, items: newItems });
        setShowAssetModal(false);
        setActiveItemIndex(null);
    };

    const removeItem = (index: number) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index: number, field: keyof ReceiptItem, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => sum + (item.quantity * item.supplierPrice), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.items.length === 0) {
            setError("Please add at least one item to the receipt.");
            return;
        }
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/supplies/receipts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const json = await res.json();
            if (json.success) {
                router.push("/dashboard/suppliers/supplies");
            } else {
                setError(json.error || "Failed to record receipt.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href="/dashboard/suppliers/supplies" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors w-fit">
                    <ChevronLeft size={12} /> Back to Registry
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Record Supply Receipt</h1>
                        <p className="text-secondary text-sm">Log a multi-item shipment arrival from an authorized vendor.</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-sm flex items-center justify-center text-primary">
                        <Truck size={24} />
                    </div>
                </div>
            </div>

            {/* Shipment Metadata - Top Section */}
            <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="text-xs font-bold uppercase tracking-widest">Shipment Overview</div>
                    <div className="flex items-center gap-4 text-primary font-black tabular-nums bg-primary/5 px-4 py-1.5 rounded-sm">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Total Value:</span>
                        <span>₵{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Receipt Number</label>
                        <input
                            type="text"
                            required
                            value={formData.receiptNumber}
                            onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                            className="w-full bg-muted border border-border px-3 py-2 rounded-sm text-xs font-mono focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Supplier</label>
                        <select
                            required
                            value={formData.supplier}
                            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                            className="w-full bg-muted border border-border px-3 py-2 rounded-sm text-xs focus:outline-none focus:border-primary"
                        >
                            <option value="">Select Vendor...</option>
                            {suppliers.map(s => (
                                <option key={s._id} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Arrival Date</label>
                        <input
                            type="date"
                            required
                            value={formData.arrivalDate}
                            onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                            className="w-full bg-muted border border-border px-3 py-2 rounded-sm text-xs focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Notes (Optional)</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-muted border border-border px-3 py-2 rounded-sm text-xs min-h-[40px] focus:outline-none focus:border-primary h-[38px] resize-none"
                            placeholder="Add shipment notes..."
                        />
                    </div>
                </div>
            </section>

            {/* Items List */}
            <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                        <Package size={18} className="text-primary" />
                        <h3 className="text-xs font-bold uppercase tracking-widest">Received Products</h3>
                    </div>
                    <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center gap-2 text-[10px] font-bold text-primary border border-primary px-3 py-1.5 rounded-sm hover:bg-primary/5 uppercase tracking-widest transition-colors"
                    >
                        <Plus size={12} /> Add Product
                    </button>
                </div>

                {formData.items.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400 border-2 border-dashed border-slate-100 rounded-sm">
                        <Package size={48} className="opacity-10" />
                        <p className="text-xs font-bold uppercase tracking-widest">No products added yet</p>
                        <button type="button" onClick={addItem} className="text-[10px] text-primary underline font-bold uppercase tracking-widest">Click to add first item</button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {formData.items.map((item, index) => (
                            <div key={index} className="bg-slate-50 border border-slate-200 p-4 rounded-sm relative group">
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pr-8">
                                    <div className="md:col-span-3 flex flex-col gap-1.5">
                                        <label className="text-[9px] font-bold text-secondary uppercase tracking-tighter">Product Name</label>
                                        <div className="relative">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    required
                                                    readOnly
                                                    value={item.name}
                                                    onClick={() => {
                                                        setActiveItemIndex(index);
                                                        setShowAssetModal(true);
                                                    }}
                                                    className="w-full bg-white border border-border px-3 py-1.5 rounded-sm text-xs focus:outline-none focus:border-primary cursor-pointer hover:bg-slate-50 transition-colors"
                                                    placeholder="Click to select product..."
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveItemIndex(index);
                                                        setShowAssetModal(true);
                                                    }}
                                                    className="p-1.5 bg-primary/5 text-primary border border-primary/20 rounded-sm hover:bg-primary/10 transition-colors"
                                                >
                                                    <Search size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 flex flex-col gap-1.5">
                                        <label className="text-[9px] font-bold text-secondary uppercase tracking-tighter">SKU</label>
                                        <input
                                            type="text"
                                            required
                                            value={item.sku}
                                            onChange={(e) => updateItem(index, 'sku', e.target.value)}
                                            className="bg-white border border-border px-3 py-1.5 rounded-sm text-xs focus:outline-none focus:border-primary font-mono"
                                            placeholder="SKU"
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex flex-col gap-1.5">
                                        <label className="text-[9px] font-bold text-secondary uppercase tracking-tighter">Batch ID</label>
                                        <input
                                            type="text"
                                            required
                                            value={item.batchId}
                                            onChange={(e) => updateItem(index, 'batchId', e.target.value)}
                                            className="bg-white border border-border px-3 py-1.5 rounded-sm text-xs focus:outline-none focus:border-primary"
                                            placeholder="Batch #"
                                        />
                                    </div>
                                    <div className="md:col-span-3 flex flex-col gap-1.5">
                                        <label className="text-[9px] font-bold text-secondary uppercase tracking-tighter">Quantity</label>
                                        <div className="flex">
                                            <input
                                                type="number"
                                                required
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                                className="w-full bg-white border border-border border-r-0 px-2 py-1.5 rounded-l-sm text-xs focus:outline-none focus:border-primary"
                                            />
                                            <select
                                                value={item.unit}
                                                onChange={(e) => updateItem(index, 'unit', e.target.value)}
                                                className="bg-slate-100 border border-border px-2 py-1.5 rounded-r-sm text-[9px] font-bold uppercase"
                                            >
                                                <option>Liters</option>
                                                <option>Kg</option>
                                                <option>Bags</option>
                                                <option>Cases</option>
                                                <option>Cartons</option>
                                                <option>Boxes</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 flex flex-col gap-1.5 text-blue-600">
                                        <label className="text-[9px] font-bold uppercase tracking-tighter">Supplier Price (Cost)</label>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold opacity-60">₵</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                value={item.supplierPrice}
                                                onChange={(e) => updateItem(index, 'supplierPrice', Number(e.target.value))}
                                                className="w-full bg-white border border-blue-200 pl-5 pr-2 py-1.5 rounded-sm text-xs focus:outline-none focus:border-blue-500 font-bold tabular-nums"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 flex flex-col gap-1.5">
                                        <label className="text-[9px] font-bold text-secondary uppercase tracking-tighter">Selling Price</label>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-secondary">₵</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                value={item.unitPrice}
                                                onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                                className="w-full bg-white border border-border pl-5 pr-2 py-1.5 rounded-sm text-xs focus:outline-none focus:border-primary"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    {/* Sub-row for meta */}
                                    <div className="md:col-span-2 flex flex-col gap-1.5">
                                        <label className="text-[9px] font-bold text-secondary uppercase tracking-tighter">Category</label>
                                        <select
                                            value={item.category}
                                            onChange={(e) => updateItem(index, 'category', e.target.value)}
                                            className="bg-white border border-border px-3 py-1.5 rounded-sm text-xs focus:outline-none focus:border-primary"
                                        >
                                            <option>Herbicide</option>
                                            <option>Fertilizer</option>
                                            <option>Insecticide</option>
                                            <option>Fungicide</option>
                                            <option>Equipment</option>
                                            <option>General</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 flex flex-col gap-1.5">
                                        <label className="text-[9px] font-bold text-secondary uppercase tracking-tighter">Expiry Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={item.expiryDate}
                                            onChange={(e) => updateItem(index, 'expiryDate', e.target.value)}
                                            className="bg-white border border-border px-3 py-1.5 rounded-sm text-xs focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex flex-col gap-1.5">
                                        <label className="text-[9px] font-bold text-secondary uppercase tracking-tighter">Sub-total (Cost)</label>
                                        <div className="h-[34px] flex items-center px-3 bg-blue-50 border border-blue-100 rounded-sm text-xs font-black text-blue-700">
                                            ₵{(item.quantity * item.supplierPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Action Footer */}
            <div className="flex flex-col gap-4">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-widest p-4 rounded-sm">{error}</div>}
                <div className="flex items-center justify-between border-t border-border pt-8 mt-4">
                    <div className="flex items-center gap-3 text-secondary">
                        <Save size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Finalize Batch Receipt Entry</span>
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData({
                                receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
                                supplier: "",
                                arrivalDate: new Date().toISOString().split('T')[0],
                                items: [],
                                notes: ""
                            })}
                            className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest px-6 py-2.5 rounded-sm hover:bg-muted transition-colors"
                        >
                            <RotateCcw size={14} /> Clear Ledger
                        </button>
                        <button
                            type="submit"
                            disabled={loading || formData.items.length === 0}
                            className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-8 py-2.5 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Commit Receipt to System
                        </button>
                    </div>
                </div>
            </div>

            {showAssetModal && (
                <AssetSelectorModal
                    isOpen={showAssetModal}
                    onClose={() => {
                        setShowAssetModal(false);
                        setActiveItemIndex(null);
                    }}
                    onSelect={(item) => {
                        if (activeItemIndex !== null) {
                            handleProductSelect(activeItemIndex, item);
                        }
                    }}
                    inventory={inventory}
                    title="Select Product for Receipt"
                    showStock={false}
                />
            )}
        </form>
    );
}
