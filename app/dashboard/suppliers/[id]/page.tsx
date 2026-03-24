"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ChevronLeft,
    Phone,
    Mail,
    MapPin,
    Building2,
    ShieldCheck,
    CreditCard,
    Edit3,
    Plus,
    FlaskConical,
    ExternalLink,
    Trash2,
    Loader2 as Loader
} from "lucide-react";
import ConfirmationModal from "@/app/dashboard/components/ConfirmationModal";

export default function SupplierManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [supplier, setSupplier] = useState<any>(null);
    const [suppliedItems, setSuppliedItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [itemUpdateLoading, setItemUpdateLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) {
                router.push("/dashboard/suppliers");
            }
        } catch (error) {
            console.error("Deletion failed:", error);
        } finally {
            setDeleteLoading(false);
            setIsDeleteModalOpen(false);
        }
    };

    useEffect(() => {
        const fetchSupplierData = async () => {
            try {
                // Fetch supplier details
                const res = await fetch(`/api/suppliers/${id}`);
                const json = await res.json();

                if (json.success) {
                    const supplierData = json.data;
                    setSupplier(supplierData);

                    // Fetch inventory items from this supplier
                    const invRes = await fetch("/api/inventory");
                    const invJson = await invRes.json();
                    if (invJson.success) {
                        const related = invJson.data.filter((item: any) =>
                            item.supplier.toLowerCase() === supplierData.name.toLowerCase()
                        );
                        setSuppliedItems(related);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch supplier details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSupplierData();
    }, [id]);

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUpdateLoading(true);
        const formData = new FormData(e.currentTarget);
        const body = {
            name: formData.get("name"),
            contactPerson: formData.get("contactPerson"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            category: formData.get("category"),
            status: formData.get("status"),
            location: formData.get("location"),
            bankDetails: {
                bank: formData.get("bank"),
                account: formData.get("account")
            }
        };

        try {
            const res = await fetch(`/api/suppliers/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (json.success) {
                setSupplier(json.data);
                setIsEditModalOpen(false);
            }
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleItemUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setItemUpdateLoading(true);
        const formData = new FormData(e.currentTarget);
        const body = Object.fromEntries(formData.entries());

        try {
            const res = await fetch(`/api/inventory/${editingItem._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (json.success) {
                // Update local state for suppliedItems
                setSuppliedItems(prev => prev.map(item => item._id === json.data._id ? json.data : item));
                setIsItemModalOpen(false);
                setEditingItem(null);
            }
        } catch (error) {
            console.error("Item update failed:", error);
        } finally {
            setItemUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-400">
                <Loader size={32} className="animate-spin text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Accessing Supplier Dossier...</span>
            </div>
        );
    }

    if (!supplier) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <h1 className="text-xl font-bold">Supplier Not Found</h1>
                <Link href="/dashboard/suppliers" className="text-primary hover:underline">Return to Registry</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Top Navigation & Actions */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <Link href="/dashboard/suppliers" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors w-fit">
                        <ChevronLeft size={12} /> Back to Registry
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold tracking-tight text-primary">{supplier.name}</h1>
                        <span className="text-xs bg-muted border border-border px-3 py-1 rounded-sm text-secondary font-bold tabular-nums">ID: {supplier._id}</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                    >
                        <Edit3 size={14} /> Edit Profile
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-muted p-6 border-b border-border flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Modify Supplier Records</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-secondary hover:text-primary transition-colors">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Organization Name</label>
                                    <input name="name" defaultValue={supplier.name} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Category</label>
                                    <select name="category" defaultValue={supplier.category} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary">
                                        <option>Agrochemicals</option>
                                        <option>Fertilizers</option>
                                        <option>Equipment</option>
                                        <option>Logistics</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Contact Person</label>
                                    <input name="contactPerson" defaultValue={supplier.contactPerson} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Status</label>
                                    <select name="status" defaultValue={supplier.status} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary">
                                        <option>Active</option>
                                        <option>Under Review</option>
                                        <option>Suspended</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Email Vector</label>
                                    <input name="email" type="email" defaultValue={supplier.email} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Secure Phone</label>
                                    <input name="phone" defaultValue={supplier.phone} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-secondary">Physical Station (Location)</label>
                                <input name="location" defaultValue={supplier.location} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Financial Institute</label>
                                    <input name="bank" defaultValue={supplier.bankDetails?.bank} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Account Number</label>
                                    <input name="account" defaultValue={supplier.bankDetails?.account} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 border border-border py-3 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors">Discard</button>
                                <button type="submit" disabled={updateLoading} className="flex-1 btn-primary py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    {updateLoading ? <Loader size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                                    Update Dossier
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
                title="Terminate Partnership"
                message={`Are you sure you want to terminate the partnership with ${supplier.name}? All associated financial records will be preserved for history, but this entity will be removed from the active registry.`}
                confirmText="Terminate Partnership"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Section: Core Details */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Reliability Index</div>
                            <div className="text-2xl font-bold text-primary tabular-nums">{supplier.reliability || '100%'}</div>
                            <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: supplier.reliability || '100%' }} />
                            </div>
                        </div>
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Active Status</div>
                            <div className={`text-2xl font-bold uppercase tabular-nums ${supplier.status === 'Active' ? 'text-green-600' : 'text-orange-600'}`}>
                                {supplier.status}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-secondary font-medium mt-1">
                                <ShieldCheck size={12} /> Compliance Guaranteed
                            </div>
                        </div>
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Operational Area</div>
                            <div className="text-lg font-bold text-primary truncate" title={supplier.location}>{supplier.location}</div>
                            <div className="flex items-center gap-1 text-[10px] text-secondary font-medium mt-1">
                                <MapPin size={12} /> Regional Hub
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center gap-2">
                            <Building2 size={16} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Organizational Blueprint</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase text-secondary">Primary Contact</span>
                                    <span className="text-sm font-bold text-primary">{supplier.contactPerson}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase text-secondary">Communication Grid</span>
                                    <div className="flex items-center gap-2 text-primary font-medium">
                                        <Mail size={14} className="text-secondary" />
                                        <span className="text-xs border-b border-border hover:text-secondary cursor-pointer">{supplier.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-primary font-medium mt-1">
                                        <Phone size={14} className="text-secondary" />
                                        <span className="text-xs">{supplier.phone}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 border-l border-border pl-8">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase text-secondary">Industry Sector</span>
                                    <span className="text-xs bg-muted px-3 py-1 rounded-sm w-fit font-bold uppercase border border-border">{supplier.category}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase text-secondary">Financial Vector</span>
                                    <div className="flex items-center gap-2 text-primary font-medium">
                                        <CreditCard size={14} className="text-secondary" />
                                        <span className="text-xs font-bold">{supplier.bankDetails?.bank || 'N/A'}</span>
                                    </div>
                                    <span className="text-[10px] tabular-nums text-secondary font-mono tracking-tighter mt-0.5">{supplier.bankDetails?.account || 'AC-NOT-REGISTERED'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <section className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FlaskConical size={16} className="text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-widest">Active Asset Contributions</h3>
                            </div>
                            <span className="text-[10px] font-bold text-secondary uppercase">{suppliedItems.length} Registered Units</span>
                        </div>
                        {suppliedItems.length > 0 ? (
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border text-[10px] text-secondary font-bold uppercase">
                                        <th className="px-6 py-3 text-secondary tracking-widest">Asset Name</th>
                                        <th className="px-6 py-3 text-secondary tracking-widest">Category</th>
                                        <th className="px-6 py-3 text-secondary tracking-widest text-right">Selling Price</th>
                                        <th className="px-6 py-3 text-secondary tracking-widest text-right">Supplier Price</th>
                                        <th className="px-6 py-3 text-secondary tracking-widest text-right">Last Update</th>
                                        <th className="px-6 py-3 text-secondary tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {suppliedItems.map((item) => (
                                        <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-primary flex items-center gap-2">
                                                {item.name}
                                                <Link href={`/dashboard/inventory/${item._id}`} className="text-secondary hover:text-primary transition-colors">
                                                    <ExternalLink size={10} />
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-secondary italic">{item.category}</td>
                                            <td className="px-6 py-4 text-right font-bold text-primary tabular-nums">₵{item.unitPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className="px-6 py-4 text-right font-bold text-blue-600 tabular-nums">₵{item.supplierPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</td>
                                            <td className="px-6 py-4 text-right text-[10px] text-secondary tabular-nums">
                                                {new Date(item.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        setEditingItem(item);
                                                        setIsItemModalOpen(true);
                                                    }}
                                                    className="text-secondary hover:text-primary transition-colors"
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center flex flex-col items-center gap-3">
                                <FlaskConical size={32} className="text-slate-200" />
                                <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">No operational assets linked to this entity</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Section: Strategic Actions */}
                <div className="flex flex-col gap-6">
                    <div className="bg-primary text-white p-6 rounded-sm shadow-md">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-6">Strategic Ops</h3>
                        <div className="flex flex-col gap-3">
                            <button className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 p-3 rounded-sm text-xs font-bold transition-all group">
                                Standard Procurement Form
                                <Plus size={14} className="opacity-40 group-hover:opacity-100" />
                            </button>
                            <button className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 p-3 rounded-sm text-xs font-bold transition-all group">
                                Quality Assurance Audit
                                <ShieldCheck size={14} className="opacity-40 group-hover:opacity-100" />
                            </button>
                            <div className="h-px bg-white/10 my-2" />
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="flex items-center gap-2 text-red-300 hover:text-red-200 text-[10px] font-bold uppercase tracking-widest transition-colors"
                            >
                                <Trash2 size={12} /> Terminate Partnership
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-sm">
                        <h4 className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-3">Procurement Intelligence</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-blue-600 font-medium">Last Deployment</span>
                                <span className="text-blue-900 font-bold tabular-nums">2 days ago</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-blue-600 font-medium">Compliance Score</span>
                                <span className="text-blue-900 font-bold tabular-nums">98.4%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Item Edit Modal */}
            {isItemModalOpen && editingItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-muted p-6 border-b border-border flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Modify Contribution: {editingItem.name}</h3>
                            <button onClick={() => { setIsItemModalOpen(false); setEditingItem(null); }} className="text-secondary hover:text-primary transition-colors">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleItemUpdate} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Asset Name</label>
                                    <input name="name" defaultValue={editingItem.name} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Category</label>
                                    <input name="category" defaultValue={editingItem.category} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Selling Price (₵)</label>
                                    <input name="unitPrice" type="number" step="0.01" defaultValue={editingItem.unitPrice} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Supplier Price (₵)</label>
                                    <input name="supplierPrice" type="number" step="0.01" defaultValue={editingItem.supplierPrice} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-secondary">Current Stock</label>
                                <input name="stock" type="number" defaultValue={editingItem.stock} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => { setIsItemModalOpen(false); setEditingItem(null); }} className="flex-1 border border-border py-3 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors">Discard</button>
                                <button type="submit" disabled={itemUpdateLoading} className="flex-1 btn-primary py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    {itemUpdateLoading ? <Loader size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                                    Update Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
