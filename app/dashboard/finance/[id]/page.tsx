"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    Download,
    Printer,
    Building2,
    Calendar,
    Clock,
    UserCheck,
    ShieldCheck,
    FileText,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    History, Lock,
    Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import FinancePrintView from "../components/FinancePrintView";

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [tx, setTx] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const res = await fetch(`/api/finance/${id}`);
                const json = await res.json();
                if (json.success) {
                    setTx(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch transaction:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [id]);

    const handleStatusUpdate = async (newStatus: string) => {
        setUpdateLoading(true);
        setMessage("");
        setError("");
        try {
            const res = await fetch(`/api/finance/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            const json = await res.json();
            if (json.success) {
                setTx(json.data);
                setMessage("Status updated successfully.");
                setTimeout(() => setMessage(""), 3000);
            } else {
                setError(json.error || "Failed to update status.");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred.");
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-400">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Accessing Transaction Records...</span>
            </div>
        );
    }

    if (!tx) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <h1 className="text-xl font-bold text-primary">Transaction Not Found</h1>
                <Link href="/dashboard/finance" className="text-xs font-bold text-secondary hover:text-primary uppercase tracking-widest">Return to Ledger</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <Link href="/dashboard/finance" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors">
                        <ChevronLeft size={12} /> Back to Ledger
                    </Link>
                    {message && (
                        <div className="bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold uppercase tracking-widest p-2 rounded-sm animate-in fade-in slide-in-from-top-2">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-widest p-2 rounded-sm animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-primary text-white rounded-sm flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-primary/10">
                            TX
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tighter text-primary">Record {tx.txId || tx._id}</h1>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${tx.status === 'Settled' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                    {tx.status}
                                </span>
                            </div>
                            <p className="text-secondary text-sm font-medium mt-1">{tx.type} • Logged via System</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.open(`/print/finance/${id}`, '_blank')}
                        className="flex items-center gap-2 text-xs font-bold text-secondary border border-border px-4 py-2 rounded-sm hover:bg-slate-50 transition-colors uppercase tracking-wider"
                    >
                        <Printer size={14} /> Print Receipt
                    </button>
                    <button
                        onClick={() => window.open(`/print/finance/${id}`, '_blank')}
                        className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-6"
                    >
                        <Download size={14} /> Download PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left: Summary & Metadata */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <div className="bg-white border border-border rounded-sm shadow-sm p-8 flex flex-col gap-8 border-t-4 border-t-primary">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[9px] font-black text-secondary uppercase tracking-widest flex items-center gap-1.5">
                                        <Building2 size={12} className="opacity-50" /> Counterparty Entity
                                    </span>
                                    <span className="text-lg font-bold text-primary">{tx.entity}</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[9px] font-black text-secondary uppercase tracking-widest flex items-center gap-1.5">
                                        <FileText size={12} className="opacity-50" /> Transaction Category
                                    </span>
                                    <span className="text-sm font-bold border-l-2 border-primary pl-3 py-0.5 uppercase tracking-tighter">{tx.category}</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[9px] font-black text-secondary uppercase tracking-widest flex items-center gap-1.5">
                                        <DollarSign size={12} className="opacity-50" /> Payment Protocol
                                    </span>
                                    <span className="text-sm font-black text-slate-700">{tx.method}</span>
                                </div>
                            </div>

                            <div className="bg-white border border-border text-primary rounded-sm p-8 flex flex-col items-center justify-center gap-3 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-2 right-2 opacity-5 rotate-12 transition-transform group-hover:rotate-0 text-secondary">
                                    <DollarSign size={100} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Value in GHS</span>
                                <div className="text-5xl font-black tabular-nums tracking-tighter text-primary">₵{tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                <div className="flex items-center gap-1.5 mt-2 bg-muted px-3 py-1 rounded-full">
                                    {tx.type === 'Revenue' ? <ArrowUpRight size={14} className="text-green-600" /> : <ArrowDownRight size={14} className="text-red-600" />}
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">{tx.type} Inflow</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 py-6 border-t border-dashed border-border">
                            <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Fiscal Annotation</span>
                            <p className="text-xs leading-relaxed text-secondary font-medium">
                                "{tx.description}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-border">
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black text-secondary uppercase opacity-60">Record ID</span>
                                <span className="text-[10px] font-black tabular-nums">{tx.txId || tx._id}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black text-secondary uppercase opacity-60">Fiscal Date</span>
                                <span className="text-[10px] font-black tabular-nums">{new Date(tx.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black text-secondary uppercase opacity-60">Status Management</span>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={tx.status}
                                        onChange={(e) => handleStatusUpdate(e.target.value)}
                                        disabled={updateLoading}
                                        className="text-[10px] font-black uppercase bg-muted border border-border rounded-sm px-2 py-1 focus:outline-none focus:border-primary disabled:opacity-50"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Settled">Settled</option>
                                        <option value="Overdue">Overdue</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                    {updateLoading && <Loader2 size={12} className="animate-spin text-primary" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-sm shadow-sm flex flex-col gap-5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-700 mb-1">Transaction Verified</div>
                        <p className="text-[10px] text-blue-600 leading-relaxed">
                            This record has been finalized and integrated into the global ledger.
                        </p>
                    </div>

                    <button className="w-full bg-muted border border-border py-4 rounded-sm flex flex-col items-center gap-1 hover:bg-slate-100 transition-all border-dashed group">
                        <History size={20} className="text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary group-hover:text-primary transition-colors">Contest Transaction</span>
                    </button>
                </div>
            </div>

        </div>
    );
}
