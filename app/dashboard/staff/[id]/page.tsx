"use client";

import { use, useState, useEffect } from "react";
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
    History,
    Loader2,
    ShieldCheck,
    Plus
} from "lucide-react";

export default function StaffManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [person, setPerson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        const fetchPerson = async () => {
            try {
                const res = await fetch(`/api/staff/${id}`);
                const json = await res.json();
                if (json.success) {
                    setPerson(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch officer details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPerson();
    }, [id]);

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUpdateLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Use flat payload to avoid overwriting nested subdocuments (preserving password)
        const body = {
            name: data.name,
            role: data.role,
            department: data.department,
            accessLevel: data.accessLevel,
            phone: data.phone,
            "credentials.email": data.email,
            performedBy: "Admin User" // In a real app, this would be the logged-in user's name
        };

        try {
            const res = await fetch(`/api/staff/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (json.success) {
                setPerson(json.data);
                setIsEditModalOpen(false);
            }
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleRevoke = async () => {
        if (!confirm("CRITICAL: Are you sure you want to revoke system access for this officer? This action will be logged in the forensic ledger.")) return;

        setUpdateLoading(true);
        try {
            const res = await fetch(`/api/staff/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "Terminated", performedBy: "Admin User" }), // Match Staff model enum
            });
            const json = await res.json();
            if (json.success) {
                setPerson(json.data);
            }
        } catch (error) {
            console.error("Revocation failed:", error);
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-400">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Accessing Secure Records...</span>
            </div>
        );
    }

    if (!person) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <h1 className="text-xl font-bold text-primary">Officer Record Not Found</h1>
                <Link href="/dashboard/staff" className="text-primary hover:underline uppercase text-[10px] font-bold tracking-widest">Return to hub</Link>
            </div>
        );
    }

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
                                <h1 className="text-3xl font-bold tracking-tight text-primary">{person.name}</h1>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-sm bg-primary text-white uppercase tracking-widest border border-primary animate-pulse-slow">{person.accessLevel}</span>
                            </div>
                            <div className="flex items-center gap-4 text-secondary text-sm font-medium mt-1">
                                <span className="flex items-center gap-1"><Award size={14} className="text-primary opacity-60" /> {person.role}</span>
                                <span className="flex items-center gap-1 text-slate-400">•</span>
                                <span className="flex items-center gap-1"><Building2 size={14} className="text-primary opacity-60" /> {person.department}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 text-xs font-bold text-secondary border border-border px-4 py-2 rounded-sm hover:bg-slate-50 transition-colors uppercase tracking-wider"
                    >
                        <Edit size={14} /> Edit Identity
                    </button>
                    <button
                        onClick={handleRevoke}
                        className="bg-red-600 text-white flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                        disabled={updateLoading || person.status === 'Terminated'}
                    >
                        <Lock size={14} /> {person.status === 'Terminated' ? 'Access Revoked' : 'Revoke Access'}
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-muted p-6 border-b border-border flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Modify Officer Identity</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-secondary hover:text-primary transition-colors">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Full Name</label>
                                    <input name="name" defaultValue={person.name} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Official Role</label>
                                    <input name="role" defaultValue={person.role} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Department</label>
                                    <input name="department" defaultValue={person.department} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Access Level</label>
                                    <select name="accessLevel" defaultValue={person.accessLevel} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary">
                                        <option>Root</option>
                                        <option>Administrator</option>
                                        <option>Officer</option>
                                        <option>Technical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Email</label>
                                    <input name="email" type="email" defaultValue={person.credentials?.email} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-secondary">Phone</label>
                                    <input name="phone" defaultValue={person.phone} className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary" required />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 border border-border py-3 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors">Discard</button>
                                <button type="submit" disabled={updateLoading} className="flex-1 btn-primary py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    {updateLoading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                                    Update Officer Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                <div className="text-[10px] font-black text-secondary uppercase tracking-widest">Account Status</div>
                                <Activity size={14} className="text-primary opacity-50" />
                            </div>
                            <div className={`text-2xl font-black uppercase ${person.status === 'Terminated' ? 'text-red-600' : 'text-primary'}`}>
                                {person.status || 'Active'}
                            </div>
                            <div className="text-[9px] font-bold text-secondary mt-1 uppercase tracking-tight">System Integrity Verified</div>
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

                    {/* RBAC Overview */}
                    <section className="bg-white border border-border rounded-sm shadow-sm p-6 overflow-hidden">
                        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                            <div className="flex items-center gap-2">
                                <Shield size={16} className="text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Role-Based Access Control (RBAC)</h3>
                            </div>
                            <span className="text-[10px] font-bold text-secondary uppercase italic">Cleared for {person.accessLevel} protocol</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-muted rounded-sm border border-border">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-primary uppercase">Inventory Hub</span>
                                        <span className="text-[9px] text-secondary">Asset Management & Tracking</span>
                                    </div>
                                    <ShieldCheck size={14} className={person.accessLevel === 'Root' || person.accessLevel === 'Administrator' || person.accessLevel === 'Officer' ? "text-primary" : "text-slate-200"} />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-muted rounded-sm border border-border">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-primary uppercase">Financial Matrix</span>
                                        <span className="text-[9px] text-secondary">Revenue & Expense Processing</span>
                                    </div>
                                    <ShieldCheck size={14} className={person.accessLevel === 'Root' || person.accessLevel === 'Administrator' ? "text-primary" : "text-slate-200"} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-muted rounded-sm border border-border">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-primary uppercase">Personnel Registry</span>
                                        <span className="text-[9px] text-secondary">Officer Enrolment & Auditing</span>
                                    </div>
                                    <ShieldCheck size={14} className={person.accessLevel === 'Root' || person.accessLevel === 'Administrator' ? "text-primary" : "text-slate-200"} />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-muted rounded-sm border border-border">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-primary uppercase">System Directives</span>
                                        <span className="text-[9px] text-secondary">Global Config & Security Wipe</span>
                                    </div>
                                    <ShieldCheck size={14} className={person.accessLevel === 'Root' ? "text-primary" : "text-slate-200"} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Real Activity Ledger */}
                    <section className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History size={16} className="text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Personnel Activity Ledger</h3>
                            </div>
                            <button className="text-[10px] font-black text-primary uppercase hover:underline">Full Forensic Log</button>
                        </div>
                        <div className="divide-y divide-border">
                            {person.auditLogs && person.auditLogs.length > 0 ? (
                                person.auditLogs.map((log: any, idx: number) => (
                                    <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-primary">{log.action}</span>
                                            <span className="text-[10px] text-secondary">{new Date(log.timestamp).toLocaleString()} • IP: {log.ip || 'INTERNAL'}</span>
                                            <span className="text-[9px] font-bold text-primary mt-1 uppercase">Performed By: {log.performedBy || 'Unknown'}</span>
                                        </div>
                                        <span className="text-[9px] font-black px-2 py-0.5 rounded-sm uppercase bg-blue-50 text-blue-700">Audit Trace</span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center flex flex-col items-center gap-3">
                                    <Activity size={32} className="text-slate-200" />
                                    <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">No forensic trail on record</p>
                                </div>
                            )}
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
                                <span className="text-sm font-bold truncate">{person.credentials?.email}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Secure Phone</span>
                                <span className="text-sm font-bold truncate">{person.phone || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Staff Identification</span>
                                <span className="text-sm font-bold">{person.staffId}</span>
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
