"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    ChevronLeft,
    Save,
    RotateCcw,
    FileText,
    Loader2,
    Building2,
    DollarSign,
    Calendar,
    Users
} from "lucide-react";

function NewInvoiceForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const customerName = searchParams.get("customer");
    const customerId = searchParams.get("id");

    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        txId: `INV-${Date.now().toString().slice(-6)}`,
        entity: customerName || "",
        type: "Revenue",
        category: "Product Sale",
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        status: "Settled",
        description: `Electronic Invoice for ${customerName || 'Client'}`,
        method: "Bank Transfer",
        recordedBy: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [custRes, authRes] = await Promise.all([
                    fetch("/api/customers"),
                    fetch("/api/auth/session") // Assuming this exists or using lib/auth
                ]);
                const custJson = await custRes.json();
                const authJson = await authRes.json();

                if (custJson.success) setCustomers(custJson.data);
                if (authJson.user) {
                    setFormData(prev => ({ ...prev, recordedBy: authJson.user.name }));
                }
            } catch (err) {
                console.error("Failed to fetch required data", err);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/finance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const json = await res.json();
            if (json.success) {
                router.push("/dashboard/invoices");
            } else {
                setError(json.error || "Failed to create invoice.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href="/dashboard/invoices" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors w-fit">
                    <ChevronLeft size={12} /> Back to Invoices
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Generate New Invoice</h1>
                        <p className="text-secondary text-sm">Create a professional electronic invoice and log revenue records.</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-sm flex items-center justify-center text-primary">
                        <FileText size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: General Info */}
                <div className="flex flex-col gap-6">
                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                        <div className="text-xs font-bold uppercase tracking-widest border-b border-border pb-4">Client Information</div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Target Institution</label>
                            <div className="relative">
                                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                                <select
                                    required
                                    value={formData.entity}
                                    onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                                    className="w-full bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-xs focus:outline-none focus:border-primary appearance-none"
                                >
                                    <option value="">Select Customer...</option>
                                    {customers.map(c => (
                                        <option key={c._id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Billing Description</label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-muted border border-border px-3 py-2 rounded-sm text-xs min-h-[100px] focus:outline-none focus:border-primary resize-none"
                                placeholder="Service or product details..."
                            />
                        </div>
                    </section>
                </div>

                {/* Right: Financials */}
                <div className="flex flex-col gap-6">
                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                        <div className="text-xs font-bold uppercase tracking-widest border-b border-border pb-4">Financial Details</div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Amount (₵)</label>
                                <div className="relative">
                                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                                    <input
                                        type="number"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                        className="w-full bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-xs focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Issue Date</label>
                                <div className="relative">
                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-xs focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => {
                                        const newStatus = e.target.value;
                                        setFormData({
                                            ...formData,
                                            status: newStatus,
                                            type: newStatus === "Pending" ? "A/R" : "Revenue"
                                        });
                                    }}
                                    className="w-full bg-muted border border-border px-3 py-2 rounded-sm text-xs focus:outline-none focus:border-primary"
                                >
                                    <option value="Settled">Settled (Paid)</option>
                                    <option value="Pending">Pending (Invoice)</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Payment Method</label>
                                <select
                                    value={formData.method}
                                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                                    className="w-full bg-muted border border-border px-3 py-2 rounded-sm text-xs focus:outline-none focus:border-primary"
                                >
                                    <option>Bank Transfer</option>
                                    <option>Cash</option>
                                    <option>Check</option>
                                    <option>Mobile Money</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Total Invoice Value</span>
                                <span className="text-xl font-black text-primary tabular-nums">₵{formData.amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </section>

                    {error && <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-widest p-4 rounded-sm">{error}</div>}

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 bg-white border border-border py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn-primary py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Generate Invoice
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default function NewInvoicePage() {
    return (
        <Suspense fallback={
            <div className="flex-grow flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-400">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Initializing...</span>
            </div>
        }>
            <NewInvoiceForm />
        </Suspense>
    );
}
