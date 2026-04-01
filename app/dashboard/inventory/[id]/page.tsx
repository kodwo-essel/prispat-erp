"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ChevronLeft,
    ArrowUpRight,
    ArrowDownRight,
    History,
    Settings,
    ShieldCheck,
    Clock,
    Download,
    Printer,
    ExternalLink,
    Edit3,
    Trash2,
    AlertTriangle,
    FlaskConical,
    BarChart3,
    Plus,
    DollarSign,
    Loader2 as Loader
} from "lucide-react";
import ConfirmationModal from "@/app/dashboard/components/ConfirmationModal";

export default function ItemManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [item, setItem] = useState<any>(null);
    const [allBatches, setAllBatches] = useState<any[]>([]); 
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [allSuppliers, setAllSuppliers] = useState<any[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Analytics State
    const [stats, setStats] = useState({ inbound: 0, sold: 0 });

    const calculateHealthIndex = (stock: number) => {
        if (stock >= 100) return 95;
        if (stock >= 25) return 75;
        if (stock >= 10) return 40;
        return 10;
    };

    useEffect(() => {
        const fetchItemData = async () => {
            try {
                // 1. Fetch the specific item being viewed
                const res = await fetch(`/api/inventory/${id}`);
                const json = await res.json();

                if (json.success) {
                    const itemData = json.data;
                    setItem(itemData);

                    // 2. Fetch ALL inventory to find sibling batches with the same SKU
                    const invRes = await fetch("/api/inventory");
                    const invJson = await invRes.json();
                    
                    let siblings: any[] = [];
                    if (invJson.success) {
                        siblings = invJson.data.filter((i: any) => i.sku === itemData.sku);
                        setAllBatches(siblings);
                    }

                    // 3. Fetch analytics (Orders, Supplies, Finance)
                    const [finRes, supRes, ordRes, allSupRes] = await Promise.all([
                        fetch("/api/finance"),
                        fetch("/api/supplies"),
                        fetch("/api/orders"),
                        fetch("/api/suppliers")
                    ]);

                    const [finJson, supJson, ordJson, allSupJson] = await Promise.all([
                        finRes.json(),
                        supRes.json(),
                        ordRes.json(),
                        allSupRes.json()
                    ]);

                    if (finJson.success) {
                        const related = finJson.data.filter((tx: any) =>
                            tx.entity.toLowerCase().includes(itemData.name.toLowerCase()) ||
                            (tx.description && tx.description.toLowerCase().includes(itemData.name.toLowerCase()))
                        );
                        setActivities(related);
                    }

                    if (supJson.success && ordJson.success) {
                        const inbound = supJson.data
                            .filter((s: any) => s.sku === itemData.sku)
                            .reduce((sum: number, s: any) => sum + (Number(s.quantity) || 0), 0);

                        const sold = ordJson.data.reduce((sum: number, order: any) => {
                            const orderItems = order.items.filter((i: any) => i.sku === itemData.sku);
                            return sum + orderItems.reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0);
                        }, 0);

                        setStats({ inbound, sold });
                    }

                    if (allSupJson.success) {
                        setAllSuppliers(allSupJson.data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch item details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItemData();
    }, [id]);

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) {
                router.push("/dashboard/inventory");
            }
        } catch (error) {
            console.error("Deletion failed:", error);
        } finally {
            setDeleteLoading(false);
            setIsDeleteModalOpen(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUpdateLoading(true);
        const formData = new FormData(e.currentTarget);
        const body = Object.fromEntries(formData.entries());

        try {
            const res = await fetch(`/api/inventory/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (json.success) {
                setItem(json.data);
                setIsEditModalOpen(false);
                // Refresh siblings
                const invRes = await fetch("/api/inventory");
                const invJson = await invRes.json();
                if (invJson.success) {
                    setAllBatches(invJson.data.filter((i: any) => i.sku === json.data.sku));
                }
            }
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-400">
                <Loader size={32} className="animate-spin text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Retrieving Secure Asset Data...</span>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <h1 className="text-xl font-bold">Asset Not Found</h1>
                <Link href="/dashboard/inventory" className="text-primary hover:underline">Return to Registry</Link>
            </div>
        );
    }

    const totalCurrentStock = allBatches.reduce((sum, b) => sum + (b.stock || 0), 0);
    const healthIndex = calculateHealthIndex(totalCurrentStock);

    return (
        <div className="flex flex-col gap-6">
            {/* Top Navigation & Actions */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <Link href="/dashboard/inventory" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors w-fit">
                        <ChevronLeft size={12} /> Back to Registry
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold tracking-tight text-primary">{item.name}</h1>
                        <span className="text-xs bg-muted border border-border px-3 py-1 rounded-sm text-secondary font-bold tabular-nums tracking-widest uppercase">SKU: {item.sku}</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 text-xs font-bold text-secondary border border-border px-4 py-2 rounded-sm hover:bg-slate-50 transition-colors uppercase tracking-wider">
                        <Printer size={14} /> Label Print
                    </button>
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                    >
                        <Edit3 size={14} /> Modify Asset
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-muted p-6 border-b border-border flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Modify Tactical Asset</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-secondary hover:text-primary transition-colors">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Asset Name</label>
                                    <input name="name" defaultValue={item.name} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Category</label>
                                    <select name="category" defaultValue={item.category} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary">
                                        <option>Herbicide</option>
                                        <option>Fertilizer</option>
                                        <option>Insecticide</option>
                                        <option>Fungicide</option>
                                        <option>Equipment</option>
                                        <option>General</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Unit Price (₵)</label>
                                    <input name="unitPrice" type="number" step="0.01" defaultValue={item.unitPrice} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Supplier Price (₵)</label>
                                    <input name="supplierPrice" type="number" step="0.01" defaultValue={item.supplierPrice} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Current Stock</label>
                                    <input name="stock" type="number" defaultValue={item.stock} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Unit</label>
                                    <select name="unit" defaultValue={item.unit} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary">
                                        <option>Liters</option>
                                        <option>Kg</option>
                                        <option>Bags</option>
                                        <option>Cases</option>
                                        <option>Cartons</option>
                                        <option>Boxes</option>
                                        <option>Pieces</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Hazard Class</label>
                                    <select name="hazardClass" defaultValue={item.hazardClass} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary">
                                        <option>Level 1</option>
                                        <option>Level 2</option>
                                        <option>Level 3</option>
                                        <option>Extreme</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Expiry Date</label>
                                    <input
                                        name="expiryDate"
                                        type="date"
                                        defaultValue={item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ''}
                                        className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-secondary">Verified Supplier</label>
                                <select name="supplier" defaultValue={item.supplier} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary">
                                    {allSuppliers.map((sup) => (
                                        <option key={sup._id} value={sup.name}>{sup.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 border border-border py-3 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors">Discard</button>
                                <button type="submit" disabled={updateLoading} className="flex-1 btn-primary py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    {updateLoading ? <Loader size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                                    Commit Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                isLoading={deleteLoading}
                title="Decommission Asset"
                message={`Are you sure you want to permanently decommission ${item.name}? This action cannot be undone and will remove the item from active inventory records.`}
                confirmText="Decommission Asset"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Section: Core Stats & Specs */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm relative overflow-hidden group border-t-4 border-t-primary">
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Combined Registry Stock</div>
                            <div className={`text-2xl font-black tabular-nums ${totalCurrentStock < 10 ? 'text-red-600' : totalCurrentStock < 25 ? 'text-orange-600' : 'text-primary'}`}>
                                {totalCurrentStock} <span className="text-sm font-medium">{item.unit}</span>
                            </div>
                            <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-500 ${totalCurrentStock < 10 ? 'bg-red-500' : totalCurrentStock < 25 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${Math.min((totalCurrentStock / (stats.inbound || 1)) * 100, 100)}%` }} />
                            </div>
                            <div className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                                Across {allBatches.length} verified batches
                            </div>
                        </div>
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Batch Count</div>
                            <div className="text-2xl font-bold text-blue-600 uppercase tabular-nums">{allBatches.length} ACTIVE</div>
                            <div className="flex items-center gap-1 text-[10px] text-secondary font-medium mt-1 uppercase tracking-widest">
                                <ShieldCheck size={12} /> Independent Lots
                            </div>
                        </div>
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">System Health</div>
                            <div className="flex items-center mt-1">
                                <span className={`text-[9px] font-bold px-3 py-0.5 rounded-full border uppercase tracking-widest ${totalCurrentStock === 0 ? 'bg-red-50 text-red-700 border-red-200' :
                                    totalCurrentStock < 25 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                        'bg-green-50 text-green-700 border-green-200'
                                    }`}>
                                    {totalCurrentStock === 0 ? 'CRITICAL' :
                                        totalCurrentStock < 25 ? 'WARNING' :
                                            'OPTIMAL'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-secondary font-medium mt-2">
                                <BarChart3 size={12} /> Aggregate Performance
                            </div>
                        </div>
                    </div>

                    {/* Batch Level Inventory Table */}
                    <section className="bg-white border border-border rounded-sm shadow-sm overflow-hidden flex flex-col">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Plus size={16} className="text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-widest">Batch-Level Inventory Tracking</h3>
                            </div>
                            <span className="text-[9px] font-bold text-secondary uppercase tracking-widest">Precise Lot Management</span>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-border">
                                <tr className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                                    <th className="px-6 py-3 text-left">Batch ID</th>
                                    <th className="px-6 py-3 text-left">Supplier Origin</th>
                                    <th className="px-6 py-3 text-left">Stock</th>
                                    <th className="px-6 py-3 text-right">Supplier Price</th>
                                    <th className="px-6 py-3 text-right">Selling Price</th>
                                    <th className="px-6 py-3 text-left">Expiry</th>
                                    <th className="px-6 py-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {allBatches.map((batch) => (
                                    <tr key={batch._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-[11px] font-mono font-bold text-primary">{batch.batchId}</div>
                                            <div className="text-[8px] text-slate-400 mt-0.5 uppercase">Registered Lot</div>
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                            <div className="text-[10px] font-bold text-secondary uppercase tracking-tight">{batch.supplier}</div>
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                            <div className="text-[11px] font-bold text-slate-900 tabular-nums">{batch.stock} {batch.unit}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-[11px] font-bold text-orange-600 tabular-nums font-mono">
                                            ₵{batch.supplierPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 text-right text-[11px] font-bold text-primary tabular-nums font-mono">
                                            ₵{batch.unitPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 text-left text-[10px] font-bold text-secondary">
                                            {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-[0.1em] ${batch.stock === 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                                {batch.stock > 0 ? "Active" : "Depleted"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm border-l-4 border-l-blue-500">
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Total Inbound</div>
                            <div className="text-2xl font-bold text-primary tabular-nums">{stats.inbound} <span className="text-sm font-medium opacity-50">{item.unit}</span></div>
                            <div className="text-[9px] text-slate-400 mt-1 uppercase font-bold">Sum of all batch arrivals</div>
                        </div>
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm border-l-4 border-l-orange-500">
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Gross Velocity (Sold)</div>
                            <div className="text-2xl font-bold text-orange-600 tabular-nums">{stats.sold} <span className="text-sm font-medium opacity-50">{item.unit}</span></div>
                            <div className="text-[9px] text-slate-400 mt-1 uppercase font-bold">Total distributed to date</div>
                        </div>
                    </div>

                    <section className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FlaskConical size={16} className="text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-widest">Master Product Identity</h3>
                            </div>
                            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-primary/20">
                                {allBatches.length} Active Lots tracked
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 text-xs">
                                    <span className="text-secondary font-bold uppercase tracking-tighter">Commercial Category</span>
                                    <span className="text-primary font-black uppercase">{item.category}</span>
                                </div>
                                <div className="grid grid-cols-2 text-xs">
                                    <span className="text-secondary font-bold uppercase tracking-tighter">Unified Master SKU</span>
                                    <span className="font-mono font-bold text-slate-700">{item.sku}</span>
                                </div>
                                <div className="grid grid-cols-2 text-xs border-t border-dashed border-border pt-4 mt-2">
                                    <span className="text-secondary font-bold uppercase tracking-tighter text-[10px]">Combined Registry Stock</span>
                                    <span className="text-lg font-black text-primary tabular-nums">{totalCurrentStock} <span className="text-[10px] opacity-60 uppercase">{item.unit}</span></span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 border-l border-border pl-8">
                                <div className="grid grid-cols-2 text-xs">
                                    <span className="text-secondary font-bold uppercase tracking-tighter">Standard Measurement</span>
                                    <span className="text-primary font-bold uppercase">{item.unit}</span>
                                </div>
                                <div className="grid grid-cols-2 text-xs">
                                    <span className="text-secondary font-bold uppercase tracking-tighter">Current Market Price</span>
                                    <span className="text-primary font-black tabular-nums">₵{item.unitPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="grid grid-cols-2 text-xs">
                                    <span className="text-secondary font-bold uppercase tracking-tighter">Base Cost Anchor</span>
                                    <span className="text-slate-600 font-bold tabular-nums">₵{item.supplierPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                                </div>
                                <div className="grid grid-cols-2 text-xs border-t border-dashed border-border pt-4 mt-2">
                                    <span className="text-secondary font-bold uppercase tracking-tighter text-[10px]">Hazard Classification</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest w-fit px-2 py-0.5 rounded-sm border ${item.hazardClass === 'Extreme' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                        {item.hazardClass}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 px-6 py-3 border-t border-border flex items-center justify-center gap-2">
                            <ShieldCheck size={12} className="text-green-600" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Verified Master Record in Agriculture National Registry</span>
                        </div>
                    </section>

                    <section className="bg-white border border-border rounded-sm shadow-sm overflow-hidden min-h-[200px] flex flex-col">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History size={16} className="text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-widest">Global Asset Ledger</h3>
                            </div>
                            <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">Export Ledger</button>
                        </div>
                        {activities.length > 0 ? (
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border text-[10px] text-secondary font-bold uppercase">
                                        <th className="px-6 py-3">Operation</th>
                                        <th className="px-6 py-3">Amount</th>
                                        <th className="px-6 py-3">Stakeholder</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {activities.map((log) => (
                                        <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${log.type === 'Revenue' ? 'bg-green-50 text-green-700' :
                                                    log.type === 'Expense' ? 'bg-orange-50 text-orange-700' :
                                                        'bg-blue-50 text-blue-700'
                                                    }`}>
                                                    {log.type}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 font-bold tabular-nums ${log.type === 'Revenue' ? 'text-green-600' : 'text-orange-600'}`}>
                                                ₵{log.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-secondary font-medium">{log.entity}</td>
                                            <td className="px-6 py-4 text-xs text-secondary tabular-nums">{new Date(log.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-primary font-bold text-[10px] uppercase">{log.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex-grow flex items-center justify-center p-12 text-center flex-col gap-2">
                                <History size={32} className="text-slate-200" />
                                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">No matching transactional history</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Section: Quick Access & Notifications */}
                <div className="flex flex-col gap-6">
                    <div className="bg-primary text-white p-6 rounded-sm shadow-md">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-6">Commander's Actions</h3>
                        <div className="flex flex-col gap-3">
                            <button className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 p-3 rounded-sm text-xs font-bold transition-all group">
                                Schedule Quality Audit
                                <ArrowUpRight size={14} className="opacity-40 group-hover:opacity-100" />
                            </button>
                            <button className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 p-3 rounded-sm text-xs font-bold transition-all group">
                                Internal Inventory Transfer
                                <ArrowUpRight size={14} className="opacity-40 group-hover:opacity-100" />
                            </button>
                            <button className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 p-3 rounded-sm text-xs font-bold transition-all group">
                                Generate Disposal Warrant
                                <ArrowUpRight size={14} className="opacity-40 group-hover:opacity-100" />
                            </button>
                            <div className="h-px bg-white/10 my-2" />
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="flex items-center gap-2 text-red-300 hover:text-red-200 text-[10px] font-bold uppercase tracking-widest transition-colors"
                            >
                                <Trash2 size={12} /> Mark for Decommission
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 size={16} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Stock Health Index</h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between text-[10px] font-bold uppercase text-secondary">
                                    <span>Chemical Stability</span>
                                    <span>{healthIndex}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full">
                                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${healthIndex}%` }} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between text-[10px] font-bold uppercase text-secondary">
                                    <span>Storage Utilization</span>
                                    <span>{Math.min(100, (item.stock / 5000) * 100).toFixed(0)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full">
                                    <div className="h-full bg-blue-400 transition-all duration-1000" style={{ width: `${Math.min(100, (item.stock / 5000) * 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {item.stock < 25 && (
                        <div className={`${item.stock < 10 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-orange-50 border-orange-200 text-orange-800'} border p-5 rounded-sm flex flex-col gap-3 shadow-sm`}>
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={16} className={item.stock < 10 ? 'text-red-600' : 'text-orange-600'} />
                                <h3 className="text-xs font-black uppercase tracking-widest">
                                    {item.stock < 10 ? 'Critical System Alert' : 'Stock Depletion Warning'}
                                </h3>
                            </div>
                            <p className="text-[11px] leading-relaxed font-medium">
                                {item.stock < 10
                                    ? "ASSET DEPLETED: Immediate re-stocking protocol required to prevent operational stall."
                                    : "LOW BUFFER: Stock level has dropped below safety threshold. Procurement initiation recommended."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
