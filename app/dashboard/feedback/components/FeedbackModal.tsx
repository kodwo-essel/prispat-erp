"use client";

import { useState, useEffect } from "react";
import { Plus, X, Star, Loader2, MessageSquare } from "lucide-react";

interface Customer {
    _id: string;
    name: string;
}

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    preSelectedCustomer?: { id: string; name: string };
}

export default function FeedbackModal({ isOpen, onClose, onSuccess, preSelectedCustomer }: FeedbackModalProps) {
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const [isOneTime, setIsOneTime] = useState(false);
    const [formData, setFormData] = useState({
        customerId: preSelectedCustomer?.id || "",
        customerName: preSelectedCustomer?.name || "",
        customerPhone: "",
        type: "Compliment",
        rating: 5,
        comment: ""
    });

    useEffect(() => {
        if (!preSelectedCustomer && isOpen) {
            fetchCustomers();
        }
    }, [isOpen]);

    const fetchCustomers = async () => {
        setSearchLoading(true);
        try {
            const res = await fetch("/api/customers");
            const json = await res.json();
            if (json.success) {
                setCustomers(json.data);
            }
        } catch (error) {
            console.error("Failed to fetch customers:", error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.customerName || !formData.comment) return;

        setLoading(true);
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const json = await res.json();
            if (json.success) {
                onSuccess();
                onClose();
                setIsOneTime(false);
                setFormData({
                    customerId: preSelectedCustomer?.id || "",
                    customerName: preSelectedCustomer?.name || "",
                    customerPhone: "",
                    type: "Compliment",
                    rating: 5,
                    comment: ""
                });
            }
        } catch (error) {
            console.error("Failed to save feedback:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-muted p-6 border-b border-border flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={18} className="text-primary" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Record Customer Feedback</h3>
                    </div>
                    <button onClick={onClose} className="text-secondary hover:text-primary transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Customer Selection */}
                    {!preSelectedCustomer && (
                        <div className="space-y-4">
                            <div className="flex bg-muted p-1 rounded-sm border border-border w-fit">
                                <button
                                    type="button"
                                    onClick={() => { setIsOneTime(false); setFormData({ ...formData, customerId: "", customerName: "" }); }}
                                    className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all ${!isOneTime ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-primary"}`}
                                >
                                    Registered Client
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsOneTime(true); setFormData({ ...formData, customerId: "", customerName: "" }); }}
                                    className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all ${isOneTime ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-primary"}`}
                                >
                                    One-time / Walk-in
                                </button>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">
                                    {isOneTime ? "Customer Name (Manual Entry)" : "Select Registered Customer"}
                                </label>
                                {isOneTime ? (
                                    <input
                                        type="text"
                                        className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary font-bold"
                                        placeholder="Enter customer name..."
                                        value={formData.customerName}
                                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                        required
                                    />
                                ) : (
                                    <select
                                        className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary font-bold"
                                        value={formData.customerId}
                                        onChange={(e) => {
                                            const selected = customers.find(c => c._id === e.target.value);
                                            setFormData({ ...formData, customerId: e.target.value, customerName: selected?.name || "", customerPhone: "" });
                                        }}
                                        required
                                    >
                                        <option value="">Select a Customer...</option>
                                        {customers.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {isOneTime && (
                                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                                    <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Phone Number (Optional)</label>
                                    <input
                                        type="tel"
                                        className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary font-bold"
                                        placeholder="+233 XXX XXX XXX"
                                        value={formData.customerPhone}
                                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {preSelectedCustomer && (
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Customer</label>
                            <div className="text-sm font-bold text-primary px-4 py-2 bg-slate-50 border border-dashed border-border rounded-sm">
                                {preSelectedCustomer.name}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Feedback Type</label>
                            <select
                                className="bg-muted border border-border px-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary font-bold"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option>Compliment</option>
                                <option>Complaint</option>
                                <option>Suggestion</option>
                                <option>Query</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Institutional Rating</label>
                            <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star
                                            size={20}
                                            className={star <= formData.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-secondary tracking-widest">Detailed Observations</label>
                        <textarea
                            className="bg-muted border border-border px-4 py-3 rounded-sm text-xs w-full focus:outline-none focus:border-primary min-h-[120px] font-medium leading-relaxed"
                            placeholder="Record qualitative feedback, specific incidents or suggestions offered by the client..."
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-border py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.customerName}
                            className="flex-1 bg-primary text-white py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg active:scale-[0.98]"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                            Log Intelligence Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
