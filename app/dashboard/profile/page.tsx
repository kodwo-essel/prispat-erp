"use client";

import { useState, useEffect } from "react";
import {
    Shield,
    User,
    Mail,
    Phone,
    Briefcase,
    Building2,
    Clock,
    Activity,
    LogOut,
    CheckCircle2,
    Loader2,
    Plus,
    ShieldCheck
} from "lucide-react";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
    const [changing, setChanging] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [status, setStatus] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/auth/me");
                const data = await res.json();
                if (data.success && data.user) {
                    const userId = data.user._id || data.user.id;
                    // Fetch full staff details using the ID from session/user
                    const staffRes = await fetch(`/api/staff/${userId}`);
                    const staffData = await staffRes.json();
                    if (staffData.success) {
                        setUser(staffData.data);
                    } else {
                        // Fallback to session/me user if secondary API fails
                        setUser({
                            ...data.user,
                            credentials: data.user.credentials || { email: data.user.email },
                            phone: data.user.phone || "N/A",
                            department: data.user.department || "N/A"
                        });
                    }
                }
            } catch (error) {
                console.error("Profile fetch failed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setStatus({ error: "New passwords do not match." });
            return;
        }

        setChanging(true);
        setStatus(null);

        try {
            const res = await fetch("/api/auth/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                }),
            });

            const data = await res.json();
            if (data.success) {
                setStatus({ success: "Password updated successfully." });
                setPasswords({ current: "", new: "", confirm: "" });
                setTimeout(() => {
                    setIsPasswordModalOpen(false);
                    setStatus(null);
                }, 2000);
            } else {
                setStatus({ error: data.error || "Failed to update password." });
            }
        } catch (error) {
            setStatus({ error: "System failure. Try again later." });
        } finally {
            setChanging(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const fields = Object.fromEntries(formData.entries());

        const body = {
            name: fields.name,
            phone: fields.phone,
            "credentials.email": fields.email,
            performedBy: user.name
        };

        try {
            const res = await fetch(`/api/staff/${user._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (data.success) {
                setUser(data.data);
                setIsEditModalOpen(false);
            }
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Hydrating Security Profile...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20">
            {/* Header / Identity Hub */}
            <div className="flex flex-col gap-1 border-b border-border pb-8">
                <div className="flex items-center gap-4 mb-2 text-primary">
                    <Shield size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Personal Security Vault</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                    Security <span className="text-primary font-black uppercase">Protocol</span> Node
                </h1>
                <p className="text-secondary text-sm font-medium mt-2">Verified identity management for authorized institutional personnel.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Identity Card */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white border border-border overflow-hidden relative group">
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="absolute top-4 left-4 z-10 p-2 bg-white/80 backdrop-blur-sm border border-border rounded-full text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm opacity-0 group-hover:opacity-100"
                        >
                            <User size={14} />
                        </button>
                        <div className="h-32 bg-slate-50 relative border-b border-border">
                            {/* Background decorative elements */}
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] bg-[size:20px_20px]"></div>
                        </div>
                        <div className="px-6 pb-6 pt-0 -mt-12 relative flex flex-col items-center text-center">
                            <div className="h-24 w-24 bg-white border-4 border-white shadow-xl rounded-sm overflow-hidden mb-4 flex items-center justify-center text-primary font-black text-2xl group-hover:scale-105 transition-transform">
                                {user?.name?.split(" ").map((n: any) => n[0]).join("")}
                            </div>
                            <div className="flex flex-col gap-1 items-center">
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{user?.name}</h2>
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="text-[8px] font-black text-primary uppercase tracking-[0.2em] hover:underline"
                                >
                                    Modify Profile
                                </button>
                            </div>
                            <div className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 mt-4 rounded-full border border-primary/20">
                                {user?.role}
                            </div>

                            <div className="w-full h-px bg-border my-6"></div>

                            <div className="flex flex-col gap-4 w-full text-left">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-slate-50 border border-border flex items-center justify-center shrink-0">
                                        <Building2 size={14} className="text-secondary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-secondary uppercase tracking-widest">Department</span>
                                        <span className="text-xs font-bold text-slate-800">{user?.department || "N/A"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-slate-50 border border-border flex items-center justify-center shrink-0">
                                        <Shield size={14} className="text-secondary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-secondary uppercase tracking-widest">Access Level</span>
                                        <span className="text-xs font-bold text-slate-800">{user?.accessLevel}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-slate-50 border border-border flex items-center justify-center shrink-0">
                                        <Briefcase size={14} className="text-secondary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-secondary uppercase tracking-widest">Staff Identification</span>
                                        <span className="text-xs font-bold text-primary tabular-nums tracking-widest">{user?.staffId}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-4 right-4 h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                    </div>

                    {/* Advanced Security Controls */}
                    <div className="bg-white border border-border p-6 flex flex-col gap-4">
                        <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-border pb-3 mb-1">
                            Security Credentials
                        </div>
                        <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="w-full bg-primary text-white py-4 rounded-sm flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md active:scale-[0.98]"
                        >
                            <Shield size={16} /> Change Access Password
                        </button>
                    </div>
                </div>

                {/* Secure Details & Logs */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Personnel Credentials */}
                    <div className="bg-white border border-border p-8 flex flex-col gap-6">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 size={18} className="text-primary" />
                                <h3 className="text-xs font-black uppercase tracking-widest">Verified Credentials</h3>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline decoration-primary/30 decoration-2 underline-offset-4"
                            >
                                Edit Profile
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Electronic Mail</label>
                                <div className="flex items-center gap-3 bg-slate-50 border border-border px-4 py-3 group hover:border-primary transition-colors cursor-default">
                                    <Mail size={16} className="text-secondary group-hover:text-primary transition-colors" />
                                    <span className="text-sm font-bold text-slate-700">{user?.credentials?.email || "N/A"}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Direct Comms (Phone)</label>
                                <div className="flex items-center gap-3 bg-slate-50 border border-border px-4 py-3 group hover:border-primary transition-colors cursor-default">
                                    <Phone size={16} className="text-secondary group-hover:text-primary transition-colors" />
                                    <span className="text-sm font-bold text-slate-700">{user?.phone || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational History / Audit Logs */}
                    <div className="bg-white border border-border p-8 flex flex-col gap-6">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <div className="flex items-center gap-3">
                                <Activity size={18} className="text-primary" />
                                <h3 className="text-xs font-black uppercase tracking-widest">Personnel Operational Tracking</h3>
                            </div>
                            <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                <Clock size={10} /> Live Registry Feed
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            {user?.auditLogs && user.auditLogs.length > 0 ? (
                                [...user.auditLogs].reverse().map((log: any, idx: number) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50 border-l-[3px] border-primary group hover:bg-white transition-colors">
                                        <div className="flex flex-col flex-grow">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{log.action}</span>
                                                <span className="text-[8px] font-bold text-slate-400 tabular-nums uppercase">{new Date(log.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p className="text-[10px] font-medium text-secondary leading-relaxed">
                                                Registry transaction recorded via Internal Node Access Protocol.
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 border border-dashed border-border flex flex-col items-center justify-center gap-3 text-slate-300">
                                    <Activity size={24} className="opacity-20" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Zero Operational Footprint Detected</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Termination Zone */}
            <div className="mt-4 pt-12 border-t-2 border-dashed border-border flex justify-between items-center opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Session Termination</span>
                    <p className="text-[10px] text-secondary font-medium uppercase tracking-tighter">Securely log out of the decentralized ERP node.</p>
                </div>
                <button
                    onClick={async () => {
                        await fetch("/api/auth/logout", { method: "POST" });
                        window.location.href = "/login";
                    }}
                    className="flex items-center gap-3 px-8 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm shadow-lg hover:bg-black transition-all"
                >
                    <LogOut size={14} /> Terminate Hub Session
                </button>
            </div>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-border w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
                            <h2 className="text-xs font-black uppercase tracking-widest text-primary">Modify Identity Details</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-secondary hover:text-primary transition-colors">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Full Name</label>
                                    <input
                                        name="name"
                                        defaultValue={user?.name}
                                        required
                                        className="bg-slate-50 border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all font-bold text-slate-900"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Secure Phone</label>
                                    <input
                                        name="phone"
                                        defaultValue={user?.phone}
                                        required
                                        className="bg-slate-50 border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all font-bold text-slate-900"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Electronic Mail</label>
                                <input
                                    name="email"
                                    type="email"
                                    defaultValue={user?.credentials?.email}
                                    required
                                    className="bg-slate-50 border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all font-bold text-slate-900"
                                />
                            </div>

                            <div className="flex items-center gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-grow py-4 text-[10px] font-black text-secondary uppercase tracking-widest hover:bg-slate-50 transition-all border border-border"
                                >
                                    Discard Changes
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="flex-grow py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-primary transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {updating ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                                    Update Identity
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-border w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col gap-2 mb-8 text-center">
                            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center self-center text-primary mb-2">
                                <Shield size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Update Access Protocol</h2>
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Modify security credentials for node entry.</p>
                        </div>

                        <form onSubmit={handlePasswordChange} className="flex flex-col gap-6">
                            {status?.error && (
                                <div className="bg-red-50 border border-red-200 p-4 text-red-600 text-[10px] font-bold uppercase tracking-tight text-center">
                                    {status.error}
                                </div>
                            )}
                            {status?.success && (
                                <div className="bg-green-50 border border-green-200 p-4 text-green-600 text-[10px] font-bold uppercase tracking-tight text-center">
                                    {status.success}
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Current Security Key</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-slate-50 border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all font-mono"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-2 border-t border-border pt-6">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest">New Protocol Key</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-slate-50 border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all font-mono"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Confirm New Key</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-slate-50 border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all font-mono"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsPasswordModalOpen(false);
                                        setStatus(null);
                                    }}
                                    className="flex-grow py-4 text-[10px] font-black text-secondary uppercase tracking-widest hover:bg-slate-50 transition-all border border-border"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={changing}
                                    className="flex-grow py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-primary transition-all disabled:opacity-50"
                                >
                                    {changing ? "Synchronizing..." : "Update Node Access"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
