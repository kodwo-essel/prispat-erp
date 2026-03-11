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
    Briefcase
} from "lucide-react";

export default function RegisterClientPage() {
    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
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
                                    placeholder="e.g. Green Valley Cooperatives"
                                    className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Entity Type</label>
                                <select className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary">
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
                                    placeholder="Full name as per ID"
                                    className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Primary Phone</label>
                                <input
                                    type="tel"
                                    placeholder="+233 XX XXX XXXX"
                                    className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Credit & Registration Metadata */}
                <div className="flex flex-col gap-6">
                    <section className="bg-slate-900 text-white p-6 rounded-sm shadow-lg">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
                            <CreditCard size={18} className="text-primary" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest">Credit Assessment</h3>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Initial Credit Multiplier</label>
                                <select className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded-sm text-xs focus:outline-none">
                                    <option className="text-slate-900">Tier 1 - Standard (0.5x)</option>
                                    <option className="text-slate-900">Tier 2 - Verified (1.0x)</option>
                                    <option className="text-slate-900">Tier 3 - Premium (2.5x)</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Pre-Approved Limit ($)</label>
                                <input
                                    type="number"
                                    className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded-sm text-xs focus:outline-none"
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
            <div className="flex items-center justify-end gap-4 border-t border-border pt-8 mt-4">
                <button className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest px-6 py-2.5 rounded-sm hover:bg-muted transition-colors">
                    <RotateCcw size={14} /> Clear Entry
                </button>
                <button className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-8 py-2.5 rounded-sm">
                    <Save size={14} /> Commit Profile to CRM
                </button>
            </div>
        </div>
    );
}
