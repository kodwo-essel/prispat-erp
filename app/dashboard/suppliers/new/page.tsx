"use client";

import Link from "next/link";
import {
    ChevronLeft,
    Save,
    RotateCcw,
    Building2,
    User,
    Mail,
    Phone,
    CreditCard,
    CheckCircle2
} from "lucide-react";

export default function OnboardSupplierPage() {
    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href="/dashboard/suppliers" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors w-fit">
                    <ChevronLeft size={12} /> Back to Directory
                </Link>
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Onboard New Supplier</h1>
                    <p className="text-secondary text-sm">Register a new manufacturing entity or distribution hub into the national procurement network.</p>
                </div>
            </div>

            {/* Onboarding Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Main Details */}
                <div className="md:col-span-2 flex flex-col gap-6">
                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
                            <Building2 size={18} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Legal Entity Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Registered Corporate Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. AgroChemical Industries Ltd"
                                    className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Tax ID / VAT Number</label>
                                <input
                                    type="text"
                                    placeholder="T-000-000-000"
                                    className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Business Category</label>
                                <select className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary">
                                    <option>General Agrochemicals</option>
                                    <option>Fertilizer Specialty</option>
                                    <option>Equipment & Logistics</option>
                                    <option>Safety & PPE</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Hub / Warehouse Address</label>
                                <textarea
                                    placeholder="Street, City, Industrial Area, Country"
                                    className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary min-h-[80px]"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
                            <User size={18} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Primary Contact Representative</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Full Legal Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Position / Title</label>
                                <input
                                    type="text"
                                    placeholder="Procurement Manager"
                                    className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Work Email Address</label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-50" />
                                    <input
                                        type="email"
                                        placeholder="j.doe@company.gov"
                                        className="w-full bg-muted border border-border px-9 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Direct Phone Line</label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-50" />
                                    <input
                                        type="tel"
                                        placeholder="+000 00 000 0000"
                                        className="w-full bg-muted border border-border px-9 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Financial & Compliance */}
                <div className="flex flex-col gap-6">
                    <section className="bg-primary text-white p-6 rounded-sm shadow-md">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
                            <CreditCard size={18} className="text-white/80" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest">Financial Settlement</h3>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[8px] font-bold text-white/60 uppercase tracking-widest">Preferred Payment Method</label>
                                <select className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded-sm text-xs focus:outline-none">
                                    <option className="text-slate-900">Swift Bank Transfer</option>
                                    <option className="text-slate-900">Automated Clearing House</option>
                                    <option className="text-slate-900">Government Procurement Card</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[8px] font-bold text-white/60 uppercase tracking-widest">Account Number (IBAN)</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded-sm text-xs focus:outline-none"
                                    placeholder="EX00 0000 0000 0000"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-white border border-border p-5 rounded-sm flex flex-col gap-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 size={16} className="text-green-600" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest">Compliance Status</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="rounded-sm border-border text-primary focus:ring-primary" />
                                <span className="text-[10px] text-secondary font-medium">Verified Environmental License</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="rounded-sm border-border text-primary focus:ring-primary" />
                                <span className="text-[10px] text-secondary font-medium">Valid ISO 9001 Certification</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="rounded-sm border-border text-primary focus:ring-primary" />
                                <span className="text-[10px] text-secondary font-medium">Regional Distribution Permit</span>
                            </label>
                        </div>
                    </section>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 border-t border-border pt-8 mt-4">
                <button className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest px-6 py-2.5 rounded-sm hover:bg-muted transition-colors">
                    <RotateCcw size={14} /> Clear Registration
                </button>
                <button className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-8 py-2.5 rounded-sm">
                    <Save size={14} /> Commit to Registry
                </button>
            </div>
        </div>
    );
}
