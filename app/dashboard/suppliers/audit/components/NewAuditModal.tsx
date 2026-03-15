"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

interface NewAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function NewAuditModal({ isOpen, onClose, onSuccess }: NewAuditModalProps) {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingSuppliers, setFetchingSuppliers] = useState(true);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        supplierId: "",
        type: "Annual Structural",
        score: 100,
        status: "Pass",
        notes: "",
        conductedBy: "",
    });

    useEffect(() => {
        if (isOpen) {
            const fetchSuppliers = async () => {
                try {
                    const res = await fetch("/api/suppliers");
                    const json = await res.json();
                    if (json.success) {
                        setSuppliers(json.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch suppliers:", err);
                } finally {
                    setFetchingSuppliers(false);
                }
            };
            fetchSuppliers();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/suppliers/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const json = await res.json();

            if (json.success) {
                onSuccess();
                onClose();
            } else {
                setError(json.error || "Failed to record audit.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-border w-full max-w-lg rounded-sm shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-primary px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={18} className="text-white" />
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Record Security Audit</h2>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-100 p-3 rounded-sm flex items-start gap-3">
                            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{error}</span>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Supplier Entity</label>
                        <select
                            required
                            className="bg-muted border border-border px-4 py-2 text-xs focus:outline-none focus:border-primary rounded-sm"
                            value={formData.supplierId}
                            onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                            disabled={fetchingSuppliers}
                        >
                            <option value="">Select Manufacturer / Agent</option>
                            {suppliers.map((s) => (
                                <option key={s._id} value={s._id}>{s.name} ({s.location})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Audit Type</label>
                            <select
                                className="bg-muted border border-border px-4 py-2 text-xs focus:outline-none focus:border-primary rounded-sm"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option>Annual Structural</option>
                                <option>Random Quality Check</option>
                                <option>New Batch Validation</option>
                                <option>Compliance Review</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Score (0-100)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                max="100"
                                className="bg-muted border border-border px-4 py-2 text-xs focus:outline-none focus:border-primary rounded-sm"
                                value={formData.score}
                                onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Result Status</label>
                            <select
                                className="bg-muted border border-border px-4 py-2 text-xs focus:outline-none focus:border-primary rounded-sm"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Pass">Pass</option>
                                <option value="Conditional">Conditional</option>
                                <option value="Fail">Fail</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Inspector Name/ID</label>
                            <input
                                type="text"
                                required
                                placeholder="E.g. J. Essel / QA-01"
                                className="bg-muted border border-border px-4 py-2 text-xs focus:outline-none focus:border-primary rounded-sm uppercase"
                                value={formData.conductedBy}
                                onChange={(e) => setFormData({ ...formData, conductedBy: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Observation Notes</label>
                        <textarea
                            rows={3}
                            className="bg-muted border border-border px-4 py-2 text-xs focus:outline-none focus:border-primary rounded-sm resize-none"
                            placeholder="Detailed notes on compliance finding..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:bg-muted transition-colors rounded-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary text-white px-8 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors rounded-sm flex items-center gap-2"
                        >
                            {loading ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                            Finalize Audit Record
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
