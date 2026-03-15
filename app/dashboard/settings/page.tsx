"use client";

import { useState, useEffect } from "react";
import {
    Settings as SettingsIcon,
    Shield,
    Globe,
    Database,
    Bell,
    Lock,
    Save,
    Undo,
    Loader2,
    Server,
    Fingerprint,
    Languages,
    Eye,
    EyeOff
} from "lucide-react";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [config, setConfig] = useState<any>({
        organizationName: "Prispat Prime Distribution",
        address: "Plot 42, Industrial Area, Kumasi, Ghana",
        email: "admin@prispat.com",
        phone: "+233 24 000 0000",
        logoUrl: "",
        systemNodeId: "GH-ACCRA-CORE-01",
        securityLevel: "Standard",
        auditRetentionDays: 365,
        mfaEnforced: false,
        ipWhitelisting: false,
        allowedIps: ["127.0.0.1", "192.168.1.1"],
        defaultCurrency: "GHS",
        timezone: "GMT",
        maintenanceMode: false
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                const json = await res.json();
                if (json.success) {
                    setConfig(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });
            const json = await res.json();
            if (json.success) {
                setMessage("SYSTEM CONFIGURATION SYNCHRONIZED SUCCESSFULLY.");
                setTimeout(() => setMessage(""), 5000);
            } else {
                setError("ERROR: " + json.error);
                setTimeout(() => setError(""), 5000);
            }
        } catch (error) {
            console.error("Failed to save settings:", error);
            setError("CRITICAL ERROR: SYNCHRONIZATION FAILURE.");
            setTimeout(() => setError(""), 5000);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-400">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Accessing Global Configuration Hub...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <SettingsIcon className="text-primary" size={24} />
                        System Foundation & Governance
                    </h1>
                    <p className="text-sm text-secondary mt-1">Global parameters and security protocols for the Prispat Prime Ecosystem.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 text-xs font-bold text-secondary border border-border px-4 py-2 rounded-sm hover:bg-muted uppercase tracking-wider transition-colors">
                        <Undo size={14} /> Revert Changes
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider min-w-[140px] justify-center"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {saving ? "Synchronizing..." : "Commit Protocol"}
                    </button>
                </div>
            </div>

            {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-widest p-4 rounded-sm animate-in fade-in slide-in-from-top-2">
                    {message}
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-widest p-4 rounded-sm animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: General & Infrastructure */}
                <div className="lg:col-span-2 flex flex-col gap-8">

                    {/* Identity & Business Profile Section */}
                    <section className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center gap-2">
                            <Server size={16} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">System Identity & Business Profile</h3>
                        </div>
                        <div className="p-6 flex flex-col gap-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Authorized Organization Name</label>
                                    <input
                                        type="text"
                                        value={config.organizationName}
                                        onChange={(e) => setConfig({ ...config, organizationName: e.target.value })}
                                        className="bg-muted border border-border px-4 py-2 rounded-sm text-sm font-bold text-primary focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Master System Node ID</label>
                                    <input
                                        type="text"
                                        value={config.systemNodeId}
                                        onChange={(e) => setConfig({ ...config, systemNodeId: e.target.value })}
                                        className="bg-muted border border-border px-4 py-2 rounded-sm text-sm font-bold text-primary focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-border pt-8">
                                <div className="flex flex-col gap-2 lg:col-span-2">
                                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Operations Headquarters Address</label>
                                    <input
                                        type="text"
                                        value={config.address}
                                        onChange={(e) => setConfig({ ...config, address: e.target.value })}
                                        className="bg-muted border border-border px-4 py-2 rounded-sm text-sm font-bold text-primary focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Official Support Phone</label>
                                    <input
                                        type="text"
                                        value={config.phone}
                                        onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                                        className="bg-muted border border-border px-4 py-2 rounded-sm text-sm font-bold text-primary focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Global Administrative Email</label>
                                    <input
                                        type="email"
                                        value={config.email}
                                        onChange={(e) => setConfig({ ...config, email: e.target.value })}
                                        className="bg-muted border border-border px-4 py-2 rounded-sm text-sm font-bold text-primary focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Branding Logo URL (SVG/PNG)</label>
                                    <input
                                        type="text"
                                        value={config.logoUrl}
                                        onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                                        className="bg-muted border border-border px-4 py-2 rounded-sm text-sm font-bold text-primary focus:outline-none focus:border-primary"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right: Localization & Notifications */}
                <div className="flex flex-col gap-8">

                    {/* Localization section */}
                    <section className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center gap-2">
                            <Globe size={16} className="text-secondary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Localization Core</h3>
                        </div>
                        <div className="p-6 flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Primary Treasury Currency</label>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black rounded-sm shadow-sm">₵</div>
                                    <select
                                        value={config.defaultCurrency}
                                        onChange={(e) => setConfig({ ...config, defaultCurrency: e.target.value })}
                                        className="bg-muted border border-border px-4 py-2 rounded-sm text-sm font-bold text-primary flex-grow focus:outline-none focus:border-primary uppercase"
                                    >
                                        <option value="GHS">GHS (Ghana Cedi)</option>
                                        <option value="USD">USD (US Dollar)</option>
                                        <option value="EUR">EUR (Euro)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Regional Time Standard</label>
                                <div className="flex items-center gap-3">
                                    <Languages size={18} className="text-secondary opacity-40 ml-2" />
                                    <select
                                        value={config.timezone}
                                        onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                                        className="bg-muted border border-border px-4 py-2 rounded-sm text-sm font-bold text-primary flex-grow focus:outline-none focus:border-primary uppercase tracking-widest"
                                    >
                                        <option value="GMT">GMT (Universal)</option>
                                        <option value="WAT">WAT (West Africa)</option>
                                        <option value="EST">EST (Eastern)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Maintenance Section */}
                    <section className={`rounded-sm border-2 transition-all p-6 flex flex-col gap-4 ${config.maintenanceMode ? 'bg-red-50 border-red-200' : 'bg-white border-border shadow-sm'}`}>
                        <div className="flex items-center gap-3">
                            <Lock className={config.maintenanceMode ? 'text-red-600' : 'text-slate-400'} size={20} />
                            <h3 className="text-xs font-black uppercase border-b-2 border-current pb-1">System Lock State</h3>
                        </div>
                        <p className="text-[10px] font-medium text-secondary">
                            {config.maintenanceMode
                                ? "SYSTEM IS CURRENTLY RESTRICTED TO ROOT ADMINISTRATORS ONLY."
                                : "Public-facing modules are active and operational across all regional nodes."}
                        </p>
                        <button
                            onClick={() => setConfig({ ...config, maintenanceMode: !config.maintenanceMode })}
                            className={`w-full py-2.5 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all border shadow-sm ${config.maintenanceMode
                                ? 'bg-red-600 text-white border-red-700 hover:bg-red-700'
                                : 'bg-slate-100 text-primary border-slate-200 hover:bg-slate-200'
                                }`}
                        >
                            {config.maintenanceMode ? "Deactivate Lockdown" : "Initiate System Lock"}
                        </button>
                    </section>

                    {/* Admin forensic info */}
                    <div className="bg-muted p-4 border border-border rounded-sm">
                        <div className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all cursor-help">
                            <Fingerprint size={24} className="text-primary" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase text-primary">Master Audit Hash</span>
                                <span className="text-[8px] font-mono break-all leading-tight">SHA-256: 4f8e-bdb8-32e7-4a81-3f86c952cf95</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
