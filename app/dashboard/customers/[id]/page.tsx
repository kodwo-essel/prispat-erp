"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    User,
    MapPin,
    CreditCard,
    TrendingUp,
    ShieldCheck,
    History,
    MessageSquare,
    Edit3,
    Trash2,
    Loader2,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Mail,
    Phone
} from "lucide-react";

export default function CustomerManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [customer, setCustomer] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                // Fetch customer details
                const res = await fetch(`/api/customers/${id}`);
                const json = await res.json();

                if (json.success) {
                    const customerData = json.data;
                    setCustomer(customerData);

                    // Fetch recent transactions for this customer
                    const finRes = await fetch("/api/finance");
                    const finJson = await finRes.json();
                    if (finJson.success) {
                        const related = finJson.data.filter((tx: any) =>
                            tx.entity.toLowerCase().includes(customerData.name.toLowerCase())
                        );
                        setTransactions(related);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch customer details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerData();
    }, [id]);

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUpdateLoading(true);
        const formData = new FormData(e.currentTarget);
        const body = Object.fromEntries(formData.entries());

        try {
            const res = await fetch(`/api/customers/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (json.success) {
                setCustomer(json.data);
                setIsEditModalOpen(false);
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
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Accessing Client Protocol...</span>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <h1 className="text-xl font-bold">Client Not Found</h1>
                <Link href="/dashboard/customers" className="text-primary hover:underline">Return to Registry</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Top Navigation & Actions */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <Link href="/dashboard/customers" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors w-fit">
                        <ChevronLeft size={12} /> Back to Registry
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold tracking-tight text-primary">{customer.name}</h1>
                        <span className="text-xs bg-muted border border-border px-3 py-1 rounded-sm text-secondary font-bold tabular-nums">REL: {customer.region}</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                    >
                        <Edit3 size={14} /> Adjust Credit/Status
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-muted p-6 border-b border-border flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Modify Client Terms</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-secondary hover:text-primary transition-colors">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Institution Name</label>
                                    <input name="name" defaultValue={customer.name} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Region / Hub</label>
                                    <select name="region" defaultValue={customer.region} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary">
                                        <option>Greater Accra</option>
                                        <option>Ashanti</option>
                                        <option>Western North</option>
                                        <option>Bono East</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Credit Limit (₵)</label>
                                    <input name="creditLimit" type="number" defaultValue={customer.creditLimit} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Status Rank</label>
                                    <select name="status" defaultValue={customer.status} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary">
                                        <option>Active</option>
                                        <option>On Hold</option>
                                        <option>Restricted</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-secondary">Primary Ops Contact</label>
                                <input name="contact" defaultValue={customer.contact} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Email Vector</label>
                                    <input name="email" type="email" defaultValue={customer.email} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Secure Phone</label>
                                    <input name="phone" defaultValue={customer.phone} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 border border-border py-3 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors">Discard</button>
                                <button type="submit" disabled={updateLoading} className="flex-1 btn-primary py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    {updateLoading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                                    Update Client Dossier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Section: Financials & History */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Credit Utilization</div>
                            <div className="text-2xl font-bold text-primary tabular-nums">₵{(customer.creditUsage || 0).toLocaleString()}</div>
                            <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${Math.min(((customer.creditUsage || 0) / customer.creditLimit) * 100, 100)}%` }} />
                            </div>
                        </div>
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Available Credit</div>
                            <div className="text-2xl font-bold text-green-600 tabular-nums">₵{(customer.creditLimit - (customer.creditUsage || 0)).toLocaleString()}</div>
                            <div className="flex items-center gap-1 text-[10px] text-secondary font-medium mt-1">
                                <TrendingUp size={12} /> Limit: ₵{customer.creditLimit.toLocaleString()}
                            </div>
                        </div>
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                            <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Outstanding Balance</div>
                            <div className="text-2xl font-bold text-orange-600 tabular-nums">₵{(customer.balance || 0).toLocaleString()}</div>
                            <div className="flex items-center gap-1 text-[10px] text-secondary font-medium mt-1">
                                <History size={12} /> Last Payment: N/A
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center gap-2">
                            <User size={16} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Client Blueprint</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase text-secondary">Operations Liaison</span>
                                    <span className="text-sm font-bold text-primary">{customer.contact}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase text-secondary">Communication Grid</span>
                                    <div className="flex items-center gap-2 text-primary font-medium">
                                        <Mail size={14} className="text-secondary" />
                                        <span className="text-xs border-b border-border hover:text-secondary cursor-pointer">{customer.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-primary font-medium mt-1">
                                        <Phone size={14} className="text-secondary" />
                                        <span className="text-xs">{customer.phone}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 border-l border-border pl-8">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase text-secondary">Geographic Sector</span>
                                    <span className="text-xs bg-muted px-3 py-1 rounded-sm w-fit font-bold uppercase border border-border">{customer.region}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <section className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History size={16} className="text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-widest">Transactional Grid</h3>
                            </div>
                            <span className="text-[10px] font-bold text-secondary uppercase">{transactions.length} Total Ops</span>
                        </div>
                        {transactions.length > 0 ? (
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border text-[10px] text-secondary font-bold uppercase">
                                        <th className="px-6 py-3">Operation</th>
                                        <th className="px-6 py-3">Amount</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {transactions.map((tx) => (
                                        <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-xs font-medium text-primary">
                                                {tx.description || tx.type}
                                            </td>
                                            <td className={`px-6 py-4 font-bold tabular-nums ${tx.type === 'Revenue' ? 'text-green-600' : 'text-orange-600'}`}>
                                                ₵{tx.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-secondary tabular-nums">{new Date(tx.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-bold uppercase text-primary">{tx.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center flex flex-col items-center gap-3">
                                <History size={32} className="text-slate-200" />
                                <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">No transactional data on record</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Section: Intelligence & Log */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center gap-2">
                            <MessageSquare size={16} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Intelligence Log</h3>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            {customer.interactions && customer.interactions.length > 0 ? (
                                customer.interactions.map((note: any, idx: number) => (
                                    <div key={idx} className="border-b border-border pb-4 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-bold text-primary italic">@{note.officer}</span>
                                            <span className="text-[9px] text-secondary tabular-nums">{new Date(note.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{note.note}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[10px] text-secondary text-center py-4 uppercase font-bold tracking-widest">No field notes available</p>
                            )}
                            <button className="flex items-center gap-2 text-[10px] font-bold text-primary hover:underline uppercase tracking-widest mt-2">
                                <Plus size={12} /> Add Field Note
                            </button>
                        </div>
                    </div>

                    <div className="bg-primary text-white p-6 rounded-sm shadow-md">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-6">Commander's Actions</h3>
                        <div className="flex flex-col gap-3">
                            <button className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 p-3 rounded-sm text-xs font-bold transition-all group">
                                Issue Electronic Invoice
                                <ArrowUpRight size={14} className="opacity-40 group-hover:opacity-100" />
                            </button>
                            <button className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 p-3 rounded-sm text-xs font-bold transition-all group">
                                Adjust Credit Authorization
                                <ShieldCheck size={14} className="opacity-40 group-hover:opacity-100" />
                            </button>
                            <div className="h-px bg-white/10 my-2" />
                            <button className="flex items-center gap-2 text-red-300 hover:text-red-200 text-[10px] font-bold uppercase tracking-widest transition-colors">
                                <Trash2 size={12} /> Revoke Access Rights
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
