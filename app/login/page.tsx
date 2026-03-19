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
        <div className="min-h-screen bg-black flex overflow-hidden font-sans selection:bg-primary/30">
            {/* Left: Cinematic Visual - Hidden on small screens */}
            <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.7 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src="/images/auth-bg.png"
                        alt="Agrochemical Laboratory"
                        className="w-full h-full object-cover grayscale-[0.2]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
                </motion.div>

                <div className="relative z-10 p-16 flex flex-col justify-between w-full">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="flex items-center gap-3"
                    >
                        <div className="h-12 w-12 bg-white rounded-sm flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] overflow-hidden p-1.5 border border-white/20">
                            <img
                                src={settings?.logoUrl || "/images/logo.jpeg"}
                                alt="Logo"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/images/logo.jpeg";
                                }}
                            />
                        </div>
                        <div className="font-black text-xl tracking-tighter text-white uppercase">
                            {settings?.organizationName || "Prispat Prime ERP"}
                        </div>
                    </motion.div>

                    <div className="max-w-xl">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="text-6xl font-black text-slate-400 leading-[0.9] tracking-tighter mb-6 uppercase"
                        >
                            <span className="text-slate-400 font-black uppercase">Unified <br />ERP SYSTEM</span>
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1, duration: 0.8 }}
                            className="text-slate-400 text-sm uppercase tracking-widest font-bold leading-relaxed border-l-2 border-primary pl-6"
                        >
                            Authorized access to the national agrochemical supply chain network. All operations are monitored via real-time forensic auditing protocols.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="flex gap-8 items-center"
                    >
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">System Status</span>
                            <span className="text-[10px] text-primary uppercase font-bold flex items-center gap-2">
                                <span className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" /> Operational
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 border-l border-white/10 pl-8">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Regional Node</span>
                            <span className="text-[10px] text-white uppercase font-bold tracking-tight">Accra-Central-Core-01</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right: Auth Form */}
            <div className="w-full lg:w-2/5 flex flex-col bg-slate-50 relative border-l border-white/5">
                <div className="flex-grow flex flex-col items-center justify-center p-8 md:p-16">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="w-full max-w-sm"
                    >
                        <div className="mb-12">
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">
                                Personnel <br />
                                <span className="text-primary tracking-normal font-black uppercase">Authentication</span>
                            </h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verified credentials required for entry.</p>
                        </div>

                        <form onSubmit={handleLogin} className="flex flex-col gap-5">
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-red-50 border border-red-200 p-4 rounded-sm flex items-start gap-3"
                                    >
                                        <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-tight leading-tight">
                                            {error}
                                        </p>
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        className="bg-green-50 border border-green-200 p-4 rounded-sm flex items-start gap-3"
                                    >
                                        <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-bold text-green-600 uppercase tracking-tight leading-tight">
                                                IDENTITY VERIFIED. SYNCHRONIZING SESSION...
                                            </p>
                                            <div className="h-0.5 bg-green-200 w-full rounded-full overflow-hidden">
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

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Officer Identification</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                        <Fingerprint size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="ST-000-0000"
                                        required
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                        className="w-full bg-white border border-slate-200 pl-12 pr-4 py-4 rounded-sm text-sm font-bold text-slate-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Security Protocol</label>
                                    <Link href="#" className="text-[9px] font-black text-primary hover:underline uppercase tracking-widest">Recover Access</Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••••••"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white border border-slate-200 pl-12 pr-4 py-4 rounded-sm text-sm font-bold text-slate-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" className="w-4 h-4 rounded-sm border-slate-300 text-primary focus:ring-primary focus:ring-offset-0 transition-all" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-700 transition-colors">Remember Node Access</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || success}
                                className="group relative w-full bg-slate-900 text-white py-5 rounded-sm overflow-hidden transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.3em]">
                                    {loading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin text-primary" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            Initiate Session
                                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>
                        </form>

                        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                    <Shield size={16} className="text-slate-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">End-to-End Encryption</span>
                                    <span className="text-[9px] text-slate-400 uppercase tracking-tighter">Verified GH-SECURE Tunnel Protocol</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="p-8 text-center">
                    <p className="text-[10px] text-slate-300 leading-relaxed max-w-xs mx-auto font-medium uppercase tracking-tight">
                        Authorized Personnel Only. Unauthorized access attempts are flagged and reported to the National Security Bureau.
                    </p>
                </div>
            </div>
        </div>
    );
}
