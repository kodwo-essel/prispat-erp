"use client";

import Link from "next/link";
import {
    ChevronLeft,
    Save,
    RotateCcw,
    Building2,
    UserCircle2,
    MapPin,
    CreditCard,
    ShieldCheck,
    Briefcase,
    Loader2,
    Mail,
    Phone
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterClientPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        region: "",
        contact: "",
        email: "",
        phone: "",
        creditLimit: 5000,
        status: "Active",
        entityType: "Agro-Retailer"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const json = await res.json();
            if (json.success) {
                router.push("/dashboard/customers");
            } else {
                setError(json.error || "Failed to register client.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href="/dashboard/customers" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors w-fit">
                    <ChevronLeft size={12} /> Back to Registry
                </Link>
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Register New Client</h1>
                    <p className="text-secondary text-sm">Official CRM intake for distributors, cooperatives, and large-scale farmers.</p>
                </div>
            </div>

            {/* Intake Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Profile Details */}
                <div className="md:col-span-2 flex flex-col gap-6">
                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
                            <Building2 size={18} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Entity Classification</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Client Full Name / Business Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Green Valley Cooperatives"
                                    className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Entity Type</label>
                                <select
                                    value={formData.entityType}
                                    onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                                    className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                >
                                    <option>Agro-Retailer</option>
                                    <option>Regional Wholesaler</option>
                                    <option>Farmer Cooperative</option>
                                    <option>Individual Largeholder</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Primary Territory</label>
                                <div className="relative">
                                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-50" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.region}
                                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                        placeholder="e.g. Sunyani West"
                                        className="w-full bg-muted border border-border px-9 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
                            <UserCircle2 size={18} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Authorized Representative</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Legal Contact Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                    placeholder="Full name as per ID"
                                    className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Primary Email</label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-50" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="contact@entity.com"
                                        className="w-full bg-muted border border-border px-9 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Primary Phone</label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-50" />
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+233 XX XXX XXXX"
                                        className="w-full bg-muted border border-border px-9 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Credit & Registration Metadata */}
                <div className="flex flex-col gap-6">
                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
                            <CreditCard size={18} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Credit Assessment</h3>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1 p-3 bg-muted border border-border rounded-sm">
                                <div className="text-[8px] font-bold text-secondary uppercase tracking-widest">Financial Protocol</div>
                                <p className="text-[10px] text-slate-600 leading-relaxed">Tier classification affects credit multipliers and repayment grace periods.</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Pre-Approved Limit ($)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.creditLimit}
                                    onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                                    className="w-full bg-muted border border-border px-3 py-2 rounded-sm text-xs focus:outline-none focus:border-primary text-slate-700 font-bold"
                                    placeholder="5000.00"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-white border border-border p-5 rounded-sm flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck size={16} className="text-primary" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-secondary">Verification Status</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-secondary cursor-pointer">
                                <input type="checkbox" className="rounded-sm border-border" /> National ID Verified
                            </label>
                            <label className="flex items-center gap-2 text-[10px] font-bold text-secondary cursor-pointer">
                                <input type="checkbox" className="rounded-sm border-border" /> District Permit Active
                            </label>
                            <label className="flex items-center gap-2 text-[10px] font-bold text-secondary cursor-pointer">
                                <input type="checkbox" className="rounded-sm border-border" /> Tax Clearance Received
                            </label>
                        </div>
                    </section>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col gap-4">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-widest p-4 rounded-sm">{error}</div>}
                <div className="flex items-center justify-end gap-4 border-t border-border pt-8 mt-4">
                    <button
                        type="button"
                        onClick={() => setFormData({
                            name: "", region: "", contact: "", email: "", phone: "",
                            creditLimit: 5000, status: "Active", entityType: "Agro-Retailer"
                        })}
                        className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest px-6 py-2.5 rounded-sm hover:bg-muted transition-colors"
                    >
                        <RotateCcw size={14} /> Clear Entry
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-8 py-2.5 rounded-sm"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Commit Profile to CRM
                    </button>
                </div>
            </div>
        </form>
    );
}
