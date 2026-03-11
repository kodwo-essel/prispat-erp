"use client";

import { use } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    UserPlus,
    Shield,
    Building2,
    Mail,
    Phone,
    Fingerprint,
    Edit,
    Activity,
    Award,
    Calendar,
    Key,
    Lock,
    History
} from "lucide-react";

export default function StaffManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    // Mock specific staff record
    const employee = {
        id: id,
        name: "Officer James Doe",
        role: "Primary Administrator",
        dept: "Executive Management",
        email: "j.doe@prispat.gh",
        phone: "+233 24 555 1010",
        access: "Root / Level 5",
        joined: "Jan 2024",
        status: "Active",
        location: "Accra Corporate Office"
    };

    const recentActions = [
        { action: "Stock Re-entry Approval", time: "2h ago", impact: "High" },
        { action: "User Access Grant: Sarah M.", time: "5h ago", impact: "High" },
        { action: "System Backup Verification", time: "昨天", impact: "Medium" }
    ];

    return (
        <div className="flex flex-col gap-8">
            {/* Header Panel */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <Link href="/dashboard/staff" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors">
                        <ChevronLeft size={12} /> Back to Hub
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-muted border border-border rounded-sm flex items-center justify-center text-primary relative shadow-sm">
                            <UserPlus size={40} className="opacity-80" />
                            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-white rounded-full" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-primary">{employee.name}</h1>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-sm bg-primary text-white uppercase tracking-widest border border-primary animate-pulse-slow">System Root</span>
                            </div>
                            <div className="flex items-center gap-4 text-secondary text-sm font-medium mt-1">
                                <span className="flex items-center gap-1"><Award size={14} className="text-primary opacity-60" /> {employee.role}</span>
                                <span className="flex items-center gap-1 text-slate-400">•</span>
                                <span className="flex items-center gap-1"><Building2 size={14} className="text-primary opacity-60" /> {employee.dept}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 text-xs font-bold text-secondary border border-border px-4 py-2 rounded-sm hover:bg-slate-50 transition-colors uppercase tracking-wider">
                        <Edit size={14} /> Edit Identity
                    </button>
                    <button className="bg-red-600 text-white flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-6 py-2 rounded-sm hover:bg-red-700 transition-colors">
                        <Lock size={14} /> Revoke Access
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Clearance & Details */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="text-[10px] font-black text-secondary uppercase tracking-widest">Clearance Level</div>
                                <Key size={14} className="text-primary opacity-50" />
                            </div>
                            <div className="text-2xl font-black text-primary uppercase">Alpha-5</div>
                            <div className="text-[9px] font-bold text-green-600 mt-1 uppercase tracking-tight">Full Authority Active</div>
                        </div>
                        <div className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="text-[10px] font-black text-secondary uppercase tracking-widest">Login Compliance</div>
                                <Activity size={14} className="text-primary opacity-50" />
                            </div>
                            <div className="text-2xl font-black text-primary">100%</div>
                            <div className="text-[9px] font-bold text-secondary mt-1 uppercase tracking-tight">MFA Token Verified</div>
                        </div>
                        <div className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="text-[10px] font-black text-secondary uppercase tracking-widest">Security Tenure</div>
                                <Calendar size={14} className="text-primary opacity-50" />
                            </div>
                            <div className="text-2xl font-black text-primary">1.2 YRS</div>
                            <div className="text-[9px] font-bold text-secondary mt-1 uppercase tracking-tight">Since onboarding</div>
                        </div>
                    </div>

                    {/* Permission Grid */}
                    <section className="bg-white border border-border rounded-sm shadow-sm p-6 overflow-hidden">
                        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                            <div className="flex items-center gap-2">
                                <Shield size={16} className="text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Granular Access Permissions</h3>
                            </div>
                            <span className="text-[10px] font-bold text-secondary uppercase">Last Updated: 2026-01-15</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Inventory Write", active: true },
                                { label: "Finance Auth", active: true },
                                { label: "Staff HR Registry", active: true },
                                { label: "Procurement Sign-off", active: true },
                                { label: "Supplier Audit", active: true },
                                { label: "Customer Credit Mod", active: true },
                                { label: "System Config", active: true },
                                { label: "Database Wipe", active: false },
                            ].map((perm, idx) => (
                                <div key={idx} className={`p-4 border rounded-sm flex flex-col gap-1 transition-all ${perm.active ? 'bg-slate-50 border-primary/20' : 'bg-white opacity-50 border-border'}`}>
                                    <span className="text-[10px] font-bold tracking-tight">{perm.label}</span>
                                    <span className={`text-[8px] font-black uppercase ${perm.active ? 'text-primary' : 'text-slate-400'}`}>{perm.active ? 'Authorized' : 'Restricted'}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Recent Log Snapshot */}
                    <section className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History size={16} className="text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Personnel Activity Ledger</h3>
                            </div>
                            <button className="text-[10px] font-black text-primary uppercase hover:underline">Full Forensic Log</button>
                        </div>
                        <div className="divide-y divide-border">
                            {recentActions.map((log, idx) => (
                                <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-primary">{log.action}</span>
                                        <span className="text-[10px] text-secondary">{log.time} • Secure Node Node-B</span>
                                    </div>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-sm uppercase ${log.impact === 'High' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>{log.impact} Impact</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right: Personal & Identifiers */}
                <div className="flex flex-col gap-6">
                    <section className="bg-slate-900 text-white p-6 rounded-sm shadow-lg flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                            <Fingerprint size={18} className="text-primary" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/80">Digital Identification</h3>
                        </div>

                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Official Email</span>
                                <span className="text-sm font-bold truncate">{employee.email}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Deployment Node</span>
                                <span className="text-sm font-bold">{employee.location}</span>
                            </div>
                            <div className="flex flex-col gap-2 mt-2">
                                <div className="text-[8px] font-black uppercase text-white/40 tracking-widest mb-1">MFA Recovery Status</div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full">
                                    <div className="h-full bg-primary w-full shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                                </div>
                                <span className="text-[9px] font-bold text-primary uppercase tracking-widest text-right">SECURED</span>
                            </div>
                        </div>
                    </section>

                    <div className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock size={16} className="text-slate-900" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-secondary">Advanced Security</h3>
                        </div>
                        <button className="w-full bg-muted border border-border py-4 rounded-sm flex flex-col items-center gap-1 hover:bg-slate-100 transition-all border-dashed">
                            <Key size={20} className="text-primary opacity-60" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Reset Passwords & Tokens</span>
                        </button>
                        <button className="w-full bg-muted border border-border py-4 rounded-sm flex flex-col items-center gap-1 hover:bg-slate-100 transition-all border-dashed">
                            <Fingerprint size={20} className="text-primary opacity-60" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Update Biometric Auth</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
