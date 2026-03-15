"use client";

import { useState, useEffect } from "react";
import { MonitorOff, ShieldAlert, Lock, ArrowRight, Leaf } from "lucide-react";

export default function MobileRestriction() {
    const [nodeId, setNodeId] = useState("PENDING...");

    useEffect(() => {
        setNodeId(Math.random().toString(36).substring(7).toUpperCase());
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-8 md:hidden print:hidden overflow-hidden font-sans">
            {/* Background Security Texture */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none overflow-hidden text-slate-400 font-mono text-[8px] leading-none">
                <div className="flex flex-wrap gap-4 p-4">
                    {Array.from({ length: 100 }).map((_, i) => (
                        <span key={i}>ENCRYPTED_NODE_AUTH_SIG_REQUIRED_LEVEL_4_SECURE_CHANNEL_ESTABLISHED_TERMINAL_ID_MATCH_FAILED_0x7FFA2</span>
                    ))}
                </div>
            </div>

            {/* Central Warning Card */}
            <div className="relative w-full max-w-sm flex flex-col items-center gap-8">
                {/* Branding / Emblem */}
                <div className="flex flex-col items-center gap-2">
                    <div className="h-16 w-16 bg-primary/10 rounded-sm border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                        <Leaf size={32} />
                    </div>
                    <div className="text-center">
                        <h2 className="text-lg font-black uppercase tracking-[0.2em] text-primary">Prispat Prime</h2>
                        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary mt-1 opacity-80">Unified ERP Platform</div>
                    </div>
                </div>

                {/* Main Alert Message */}
                <div className="w-full bg-white border border-border p-8 rounded-sm shadow-xl flex flex-col items-center text-center gap-6">
                    <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 border border-red-100">
                        <MonitorOff size={32} />
                    </div>

                    <div className="flex flex-col gap-3">
                        <h1 className="text-xl font-black uppercase tracking-tight text-primary flex items-center justify-center gap-2">
                            <ShieldAlert size={20} className="text-amber-500" />
                            Unauthorized Access
                        </h1>
                        <p className="text-xs text-secondary font-medium leading-relaxed">
                            System security protocols prohibit administrative access via mobile terminals. Prispat Prime Core requires an authorized workstation monitor ( {'>'} 1024px ) for fiscal auditing and log management.
                        </p>
                    </div>

                    <div className="w-full h-px bg-border" />

                    <div className="flex flex-col gap-2 w-full text-left">
                        <div className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60 mb-1">Terminal Status</div>
                        <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-secondary">Node ID:</span>
                            <span className="text-primary uppercase tabular-nums">{nodeId}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-secondary">Screen Config:</span>
                            <span className="text-red-600 uppercase">Insufficient Res</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-secondary">Security Clearance:</span>
                            <span className="text-amber-600 uppercase flex items-center gap-1">
                                Restricted <Lock size={10} />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Instructions */}
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                        Switch to Desktop Workstation <ArrowRight size={12} />
                    </div>
                </div>
            </div>

            {/* Corner Decorative elements */}
            <div className="absolute top-4 left-4 border-l border-t border-border h-8 w-8" />
            <div className="absolute top-4 right-4 border-r border-t border-border h-8 w-8" />
            <div className="absolute bottom-4 left-4 border-l border-b border-border h-8 w-8" />
            <div className="absolute bottom-4 right-4 border-r border-b border-border h-8 w-8" />
        </div>
    );
}
