"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    Lock,
    User,
    ChevronRight,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Fingerprint,
    Zap
} from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                const data = await res.json();
                if (data.success) {
                    setSettings(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch settings:", err);
            }
        };
        fetchSettings();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ staffId: id, password }),
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/dashboard");
                }, 1500);
            } else {
                setError(data.error || "AUTHENTICATION FAILED. INVALID CREDENTIALS.");
            }
        } catch (err) {
            setError("SYSTEM ERROR: UNABLE TO CONNECT TO IDENTITY PROVIDER.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-primary/30">
            {/* Subtle Aesthetic Accents */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-400/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[900px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-sm shadow-2xl border border-border overflow-hidden relative z-10"
            >
                {/* Left Side: Brand Identity */}
                <div className="hidden lg:flex items-center justify-center p-20 bg-white border-r border-border overflow-hidden relative">
                    <img
                        src={settings?.logoUrl || "/images/logo.jpeg"}
                        alt="Logo"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/logo.jpeg";
                        }}
                    />
                </div>

                {/* Right Side: Authentication Form */}
                <div className="p-8 md:p-14 flex flex-col justify-center">
                    <div className="max-w-xs mx-auto w-full">
                        <div className="mb-10 text-center">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-1">Welcome Back</h2>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Verification Protocol Active</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-red-50 border border-red-100 p-4 rounded-sm flex items-start gap-3"
                                    >
                                        <AlertCircle size={14} className="text-red-600 shrink-0 mt-0.5" />
                                        <p className="text-[9px] font-black text-red-600 uppercase tracking-tight">{error}</p>
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        className="bg-green-50 border border-green-100 p-4 rounded-sm flex items-start gap-3"
                                    >
                                        <CheckCircle2 size={14} className="text-green-600 shrink-0 mt-0.5" />
                                        <div className="flex flex-col gap-2 w-full">
                                            <p className="text-[9px] font-black text-green-600 uppercase tracking-tight">Access Granted. Synchronizing...</p>
                                            <div className="h-0.5 bg-green-100 w-full rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ x: "-100%" }}
                                                    animate={{ x: "0%" }}
                                                    transition={{ duration: 1.5 }}
                                                    className="h-full bg-green-600"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Personnel ID</label>
                                    <div className="relative group">
                                        <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                                        <input
                                            type="text"
                                            placeholder="ENTER ID"
                                            required
                                            value={id}
                                            onChange={(e) => setId(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-sm text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Security Key</label>
                                        <button type="button" className="text-[8px] font-black uppercase text-slate-400 hover:text-primary">Help?</button>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-sm text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primary focus:bg-white transition-all placeholder:text-slate-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || success}
                                className="w-full bg-primary text-white py-4 rounded-sm font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-primary/10"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Continue <ChevronRight size={14} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-12 flex flex-col gap-3">
                            <div className="flex items-center gap-2 opacity-50">
                                <Shield size={12} className="text-slate-400" />
                                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400">TLS 1.3 Certified Session</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Footer */}
            <div className="absolute bottom-6 text-[8px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
                National Security Gateway &bull; GH-CORE v8.0.1
            </div>
        </div>
    );
}
