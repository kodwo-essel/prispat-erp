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
    Loader2 as Loader
} from "lucide-react";
import ConfirmationModal from "@/app/dashboard/components/ConfirmationModal";

export default function ItemManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [item, setItem] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [allSuppliers, setAllSuppliers] = useState<any[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const fetchItemData = async () => {
            try {
                // Fetch item specs
                const res = await fetch(`/api/inventory/${id}`);
                const json = await res.json();

                if (json.success) {
                    const itemData = json.data;
                    setItem(itemData);

                    // Fetch real activities relating to this asset from finance
                    const finRes = await fetch("/api/finance");
                    const finJson = await finRes.json();
                    if (finJson.success) {
                        // Filter transactions that mention this item's name or SKU
                        const related = finJson.data.filter((tx: any) =>
                            tx.entity.toLowerCase().includes(itemData.name.toLowerCase()) ||
                            (tx.description && tx.description.toLowerCase().includes(itemData.name.toLowerCase()))
                        );
                        setActivities(related);
                    }
                }

                // Fetch all suppliers for the dropdown
                const supRes = await fetch("/api/suppliers");
                const supJson = await supRes.json();
                if (supJson.success) {
                    setAllSuppliers(supJson.data);
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
            }
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            setUpdateLoading(false);
        }
    };

    const calculateHealthIndex = () => {
        if (!item) return 0;
        const stockLevel = item.stock;
        if (stockLevel > 500) return 95;
        if (stockLevel > 100) return 75;
        if (stockLevel > 0) return 40;
        return 5;
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

    const healthIndex = calculateHealthIndex();

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
                        <span className="text-xs bg-muted border border-border px-3 py-1 rounded-sm text-secondary font-bold tabular-nums">ID: {item._id}</span>
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
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Current Stock</div>
                            <div className="text-2xl font-bold text-primary tabular-nums">{item.stock} <span className="text-sm font-medium">{item.unit}</span></div>
                            <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full ${item.stock > 100 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min((item.stock / 1000) * 100, 100)}%` }} />
                            </div>
                        </div>
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Hazard Ranking</div>
                            <div className="text-2xl font-bold text-blue-600 uppercase tabular-nums">{item.hazardClass}</div>
                            <div className="flex items-center gap-1 text-[10px] text-secondary font-medium mt-1">
                                <ShieldCheck size={12} /> Compliance Verified
                            </div>
                        </div>
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Health Status</div>
                            <div className={`text-2xl font-bold uppercase tabular-nums ${item.status === 'Active' ? 'text-green-600' : 'text-orange-600'}`}>{item.status}</div>
                            <div className="flex items-center gap-1 text-[10px] text-secondary font-medium mt-1">
                                <Clock size={12} /> Expiry: {new Date(item.expiryDate).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <section className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center gap-2">
                            <FlaskConical size={16} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Technical Specifications</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 text-xs">
                                    <span className="text-secondary font-medium">Category:</span>
                                    <span className="text-primary font-bold">{item.category}</span>
                                </div>
                                <div className="grid grid-cols-2 text-xs">
                                    <span className="text-secondary font-medium">SKU:</span>
                                    <span className="text-primary font-bold">{item.sku}</span>
                                </div>
                                <div className="grid grid-cols-2 text-xs">
                                    <span className="text-secondary font-medium">Batch ID:</span>
                                    <span className="text-primary font-bold">{item.batchId}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 border-l border-border pl-8">
                                <div className="grid grid-cols-2 text-xs">
                                    <span className="text-secondary font-medium">Verified Supplier:</span>
                                    <span className="text-primary font-bold underline cursor-pointer">{item.supplier}</span>
                                </div>
                                <div className="grid grid-cols-2 text-xs">
                                    <span className="text-secondary font-medium">Selling Price:</span>
                                    <span className="text-primary font-bold tabular-nums">₵{item.unitPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="grid grid-cols-2 text-xs">
                                    <span className="text-secondary font-medium">Supplier Price:</span>
                                    <span className="text-primary font-bold tabular-nums">₵{item.supplierPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                                </div>
                                <div className="grid grid-cols-2 text-xs">
                                    <span className="text-secondary font-medium">National Registry:</span>
                                    <span className="text-primary font-bold flex items-center gap-1">REG-{item.sku?.split('-')?.pop() || 'N/A'} <ExternalLink size={10} /></span>
                                </div>
                            </div>
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

                    {item.stock < 100 && (
                        <div className="bg-orange-50 border border-orange-200 p-5 rounded-sm flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-orange-700">
                                <AlertTriangle size={16} />
                                <h3 className="text-xs font-black uppercase tracking-widest">Active System Alert</h3>
                            </div>
                            <p className="text-[11px] text-orange-800 leading-relaxed font-medium">
                                Critical stock threshold breached. Immediate procurement cycle initiation recommended.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
