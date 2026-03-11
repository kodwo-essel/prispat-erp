"use client";

import Link from "next/link";
import {
    ChevronLeft,
    Save,
    RotateCcw,
    UserPlus,
    Shield,
    Building2,
    Mail,
    Phone,
    Fingerprint
} from "lucide-react";

export default function EnlistStaffPage() {
    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href="/dashboard/staff" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors w-fit">
                    <ChevronLeft size={12} /> Back to Personnel Hub
                </Link>
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Enlist New Personnel</h1>
                    <p className="text-secondary text-sm">Secure registration of new employees and department officers.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Profile Details */}
                <div className="md:col-span-2 flex flex-col gap-6">
                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
                            <UserPlus size={18} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Employee Personal Record</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Legal Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Firstname Lastname"
                                    className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Primary Email</label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-50" />
                                    <input
                                        type="email"
                                        placeholder="official@prispat.gh"
                                        className="w-full bg-muted border border-border px-9 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Contact Number</label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-50" />
                                    <input
                                        type="tel"
                                        placeholder="+233 XX XXX XXXX"
                                        className="w-full bg-muted border border-border px-9 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
                            <Building2 size={18} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Deployment & Department</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Designated Department</label>
                                <select className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary">
                                    <option>Warehouse & Logistics</option>
                                    <option>Procurement & Supply</option>
                                    <option>Finance & Accounting</option>
                                    <option>Sales & Distribution</option>
                                    <option>Executive Admin</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Employment Status</label>
                                <select className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary">
                                    <option>Full-Time Contract</option>
                                    <option>Regional Officer</option>
                                    <option>Temporary Agent</option>
                                    <option>Probationary</option>
                                </select>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Security & Access Sidebar */}
                <div className="flex flex-col gap-6">
                    <section className="bg-slate-900 text-white p-6 rounded-sm shadow-lg">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
                            <Shield size={18} className="text-primary" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">System Privileges</h3>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Access Protocol Level</label>
                                <select className="w-full bg-white/10 border border-white/20 px-3 py-2 rounded-sm text-xs focus:outline-none">
                                    <option className="text-slate-900">Level 1 - Read Only</option>
                                    <option className="text-slate-900">Level 2 - Standard Operator</option>
                                    <option className="text-slate-900">Level 3 - Financial Auth</option>
                                    <option className="text-slate-900">Level 4 - Manager Proxy</option>
                                    <option className="text-slate-900 text-red-600 font-bold">Level 5 - Root (Admin)</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1 p-3 bg-white/5 border border-white/10 rounded-sm">
                                <div className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Security Warning</div>
                                <p className="text-[10px] text-white/70 leading-relaxed">Level 4+ permits data deletion and financial record overrides. Authenticate via biometric token required.</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white border border-border p-5 rounded-sm flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Fingerprint size={16} className="text-primary" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-secondary">Onboarding Checklist</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-secondary cursor-pointer">
                                <input type="checkbox" className="rounded-sm border-border" /> Contract Signed
                            </label>
                            <label className="flex items-center gap-2 text-[10px] font-bold text-secondary cursor-pointer">
                                <input type="checkbox" className="rounded-sm border-border" /> NDAs Appoved
                            </label>
                            <label className="flex items-center gap-2 text-[10px] font-bold text-secondary cursor-pointer">
                                <input type="checkbox" className="rounded-sm border-border" /> Credentials Assigned
                            </label>
                        </div>
                    </section>
                </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-end gap-4 border-t border-border pt-8 mt-4">
                <button className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest px-6 py-2.5 rounded-sm hover:bg-muted transition-colors">
                    <RotateCcw size={14} /> Clear Entry
                </button>
                <button className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-8 py-2.5 rounded-sm">
                    <Save size={14} /> Authorize Deployment
                </button>
            </div>
        </div>
    );
}
