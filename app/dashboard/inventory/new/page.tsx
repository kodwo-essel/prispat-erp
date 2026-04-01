"use client";

import Link from "next/link";
import {
    ChevronLeft,
    Save,
    RotateCcw,
    Info,
    AlertTriangle,
    Calendar,
    Package,
    Truck,
    QrCode,
    ShieldAlert,
    Loader2,
    RefreshCw,
    Search
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AssetSelectorModal from "@/app/dashboard/components/AssetSelectorModal";

export default function RecordNewArrivalPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [showAssetModal, setShowAssetModal] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        category: "Ambient Temperature",
        stock: 0,
        unit: "Liters",
        hazardClass: "None",
        batchId: "",
        expiryDate: "",
        supplier: "",
        unitPrice: 0,
        supplierPrice: 0
    });

    const [isExistingProduct, setIsExistingProduct] = useState(false);

    const generateSKU = (name: string, unit: string, supplier: string) => {
        const cleanName = (name || "").trim();
        const cleanUnit = (unit || "").trim();
        const cleanSup = (supplier || "").trim();
        
        const namePart = (cleanName || "PROD").slice(0, 4).toUpperCase().padEnd(4, 'X');
        const unitPart = (cleanUnit || "U").slice(0, 1).toUpperCase();
        const supplierPart = (cleanSup || "SUP").slice(0, 3).toUpperCase().padEnd(3, 'X');
        
        // Use a deterministic seed based on the name length and characters to keep it stable while typing
        const seed = cleanName.length + (cleanName.charCodeAt(0) || 0) + (cleanName.charCodeAt(cleanName.length - 1) || 0);
        const stablePart = (1000 + (seed % 9000)).toString();
        
        return `${namePart}-${unitPart}-${supplierPart}-${stablePart}`;
    };

    useEffect(() => {
        const trimmedName = formData.name.trim();
        if (!isExistingProduct && (trimmedName || formData.supplier)) {
            const newSku = generateSKU(trimmedName, formData.unit, formData.supplier);
            
            // Only update if the base components actually changed to prevent jitter
            setFormData(prev => {
                if (prev.sku === newSku) return prev;
                return { ...prev, sku: newSku };
            });
        }
    }, [formData.name, formData.unit, formData.supplier, isExistingProduct]);

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

    const handleProductSelect = (item: any) => {
        setFormData(prev => ({
            ...prev,
            name: item.name,
            sku: item.sku,
            category: item.category,
            unit: item.unit,
            hazardClass: item.hazardClass || "None",
            unitPrice: item.unitPrice || 0,
            supplierPrice: item.supplierPrice || 0
        }));
        setIsExistingProduct(true);
        setShowAssetModal(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const json = await res.json();
            if (json.success) {
                router.push("/dashboard/inventory");
            } else {
                setError(json.error || "Failed to record shipment.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-4xl mx-auto">
            {/* Breadcrumbs & Title */}
            <div className="flex flex-col gap-4">
                <Link href="/dashboard/inventory" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors w-fit">
                    <ChevronLeft size={12} /> Back to Registry
                </Link>
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Record New Stock Arrival</h1>
                    <p className="text-secondary text-sm">Official entry form for verified agricultural chemical shipments.</p>
                </div>
            </div>

            {/* Main Entry Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left Column: Core Data */}
                <div className="md:col-span-2 flex flex-col gap-6">
                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
                            <Package size={18} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">General Item Specifications</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Product SKU / ID</label>
                                <div className="relative">
                                    <QrCode size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-50" />
                                    <input
                                        type="text"
                                        required
                                        readOnly
                                        value={formData.sku}
                                        placeholder="Autogenerated SKU"
                                        className="w-full bg-slate-100 border border-border px-9 py-2 rounded-sm text-sm focus:outline-none focus:ring-0 cursor-not-allowed text-secondary font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Manufacturer Batch ID</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.batchId}
                                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                                    placeholder="e.g. BN-2024-X-88"
                                    className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                                />
                            </div>

                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Commercial Name</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({ ...formData, name: e.target.value });
                                            if (isExistingProduct) setIsExistingProduct(false);
                                        }}
                                        placeholder="Full product classification name"
                                        className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowAssetModal(true)}
                                        className="p-2 border border-primary text-primary hover:bg-primary/5 rounded-sm transition-colors flex items-center justify-center min-w-[42px]"
                                        title="Select Existing Product"
                                    >
                                        <Search size={18} />
                                    </button>
                                </div>
                                {isExistingProduct && (
                                    <div className="text-[9px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1 mt-1">
                                        <ShieldAlert size={10} /> Linked to existing product registry
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Inflow Quantity</label>
                                <div className="flex">
                                    <input
                                        type="number"
                                        required
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                                        placeholder="0"
                                        className="w-full bg-muted border border-border border-r-0 px-4 py-2 rounded-l-sm text-sm focus:outline-none focus:border-primary"
                                    />
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="bg-white border border-border px-3 py-2 rounded-r-sm text-xs font-bold uppercase tracking-wider focus:outline-none"
                                    >
                                        <option>Liters</option>
                                        <option>Kg</option>
                                        <option>Bags</option>
                                        <option>Cases</option>
                                        <option>Cartons</option>
                                        <option>Boxes</option>
                                        <option>Pieces</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Storage Classification</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary appearance-none"
                                >
                                    <option>Herbicide</option>
                                    <option>Fertilizer</option>
                                    <option>Insecticide</option>
                                    <option>Fungicide</option>
                                    <option>Equipment</option>
                                    <option>General</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
                            <Truck size={18} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Shipment & Compliance</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2 text-primary">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Verified Supplier</label>
                                <select
                                    required
                                    value={formData.supplier}
                                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                    className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                >
                                    <option value="">Select Authorized Vendor...</option>
                                    {suppliers.map(s => (
                                        <option key={s._id} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Expiry Date Projection</label>
                                <div className="relative">
                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-50" />
                                    <input
                                        type="date"
                                        required
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        className="w-full bg-muted border border-border px-9 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Hazard & metadata */}
                <div className="flex flex-col gap-6">
                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
                            <ShieldAlert size={18} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Hazard Assessment</h3>
                        </div>

                        <p className="text-[10px] text-secondary mb-2 leading-relaxed">Government regulations require accurate hazard classification for all chemical imports.</p>

                        <div className="flex flex-col gap-3">
                            {[
                                { level: "None", color: "bg-green-500", desc: "Non-Toxic / General Fertilizer" },
                                { level: "Level 1", color: "bg-blue-500", desc: "Low Toxicity / Managed" },
                                { level: "Level 2", color: "bg-yellow-500", desc: "Moderate Hazard / Registered" },
                                { level: "Level 3", color: "bg-orange-600", desc: "High Toxicity / Restricted" },
                                { level: "Extreme", color: "bg-red-600", desc: "Extreme Hazard / Highly Regulated" },
                            ].map((h) => (
                                <label key={h.level} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="hazard"
                                        className="sr-only peer"
                                        checked={formData.hazardClass === h.level}
                                        onChange={() => setFormData({ ...formData, hazardClass: h.level })}
                                    />
                                    <div className="h-4 w-4 rounded-full border border-border peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                                        <div className="h-1.5 w-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 group-hover:text-primary transition-colors">{h.level}</span>
                                        <span className="text-[9px] text-secondary">{h.desc}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white border border-border p-5 rounded-sm flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Info size={14} className="text-secondary" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-secondary">Financial Clearance</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Selling Price (₵)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.unitPrice || ""}
                                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                                    placeholder="0.00"
                                    className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Supplier Price (₵)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.supplierPrice || ""}
                                    onChange={(e) => setFormData({ ...formData, supplierPrice: Number(e.target.value) })}
                                    placeholder="0.00"
                                    className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Action Footer */}
            <div className="flex flex-col gap-4">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-widest p-4 rounded-sm">{error}</div>}
                <div className="flex items-center justify-between border-t border-border pt-8 mt-4">
                    <div className="flex items-center gap-3 text-secondary">
                        <AlertTriangle size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Review Registry Entry</span>
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                setFormData({
                                    name: "", sku: "", category: "Ambient Temperature", stock: 0,
                                    unit: "Liters", hazardClass: "None", batchId: "",
                                    expiryDate: "", supplier: "", unitPrice: 0, supplierPrice: 0
                                });
                                setIsExistingProduct(false);
                            }}
                            className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest px-6 py-2.5 rounded-sm hover:bg-muted transition-colors"
                        >
                            <RotateCcw size={14} /> Reset Form
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-8 py-2.5 rounded-sm"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Commit Entry to Ledger
                        </button>
                    </div>
                </div>
            </div>

            <AssetSelectorModal
                isOpen={showAssetModal}
                onClose={() => setShowAssetModal(false)}
                onSelect={handleProductSelect}
                inventory={inventory}
                title="Select Existing Catalog Product"
                showStock={true}
            />
        </form >
    );
}
