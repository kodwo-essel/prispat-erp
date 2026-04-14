"use client";

import { useState, useEffect } from "react";
import { 
    MessageSquare, 
    Plus, 
    Search, 
    Star, 
    Trash2, 
    Loader2, 
    Filter,
    ArrowRight,
    UserCircle,
    Calendar,
    ChevronLeft,
    ChevronRight,
    FileText,
    Phone
} from "lucide-react";
import Link from "next/link";
import FeedbackModal from "./components/FeedbackModal";

export default function FeedbackDashboard() {
    const [feedback, setFeedback] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    const fetchFeedback = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/feedback");
            const json = await res.json();
            if (json.success) {
                setFeedback(json.data);
            }
        } catch (error) {
            console.error("Failed to fetch feedback:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this recorded feedback? This action cannot be undone.")) return;
        
        setDeleteLoading(id);
        try {
            const res = await fetch(`/api/feedback/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) {
                setFeedback(feedback.filter(f => f._id !== id));
            }
        } catch (error) {
            console.error("Failed to delete feedback:", error);
        } finally {
            setDeleteLoading(null);
        }
    };

    const filteredFeedback = feedback.filter(f => {
        const matchesSearch = 
            f.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.comment.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "All" || f.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const averageRating = feedback.length > 0 
        ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
        : 0;

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-primary">Intelligence & Feedback</h1>
                    <p className="text-xs font-bold text-secondary uppercase tracking-widest mt-1 opacity-60">Consolidated registry of institutional client sentiments.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2 text-[10px] uppercase tracking-widest px-6 py-3 shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
                >
                    <Plus size={14} /> Record Terminal Feedback
                </button>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                    <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-3">Institutional satisfaction</div>
                    <div className="flex items-center gap-3">
                        <div className="text-3xl font-black text-primary tabular-nums">{averageRating.toFixed(1)}</div>
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={16} className={s <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                    <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-3">Total intel logs</div>
                    <div className="text-3xl font-black text-primary tabular-nums">{feedback.length}</div>
                </div>
                <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                    <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-3">Positive Sentiments</div>
                    <div className="text-3xl font-black text-green-600 tabular-nums">
                        {feedback.filter(f => f.type === "Compliment").length}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-border p-4 rounded-sm flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4 flex-grow">
                    <div className="relative flex-grow max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                        <input
                            type="text"
                            placeholder="Filter by Client or Comment content..."
                            className="bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary font-bold"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-muted p-1 rounded-sm border border-border">
                        {["All", "Compliment", "Complaint", "Suggestion", "Query"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all ${typeFilter === type ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-primary"}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Feedback List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="bg-white border border-border rounded-sm h-[400px] flex flex-col items-center justify-center gap-4 text-slate-400">
                        <Loader2 size={32} className="animate-spin text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Retreiving Intelligence Grid...</span>
                    </div>
                ) : filteredFeedback.length === 0 ? (
                    <div className="bg-white border border-border rounded-sm h-[300px] flex flex-col items-center justify-center gap-4 text-slate-300">
                        <FileText size={48} className="opacity-10" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No feedback records on current filter</p>
                    </div>
                ) : (
                    filteredFeedback.map((item) => (
                        <div key={item._id} className="bg-white border border-border p-6 rounded-sm shadow-sm hover:border-primary/30 transition-colors group">
                            <div className="flex flex-wrap gap-6">
                                {/* Left Side: Meta */}
                                <div className="w-full md:w-48 shrink-0 flex flex-col gap-3">
                                    <div className="flex flex-col gap-1">
                                        {item.customerId ? (
                                            <Link href={`/dashboard/customers/${item.customerId}`} className="text-xs font-black text-primary hover:underline hover:text-secondary transition-colors">
                                                {item.customerName}
                                            </Link>
                                        ) : (
                                            <div className="flex flex-col">
                                                <div className="text-xs font-black text-slate-700">{item.customerName}</div>
                                                {item.customerPhone && (
                                                    <div className="flex items-center gap-1 text-[10px] text-secondary font-bold mt-0.5">
                                                        <Phone size={10} /> {item.customerPhone}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-60">Classification</div>
                                        <span className={`text-[9px] font-black px-2 py-1 rounded-sm uppercase tracking-tighter w-fit ${
                                            item.type === 'Complaint' ? 'bg-red-50 text-red-600 border border-red-100' :
                                            item.type === 'Compliment' ? 'bg-green-50 text-green-600 border border-green-100' :
                                            'bg-slate-50 text-slate-600 border border-slate-200'
                                        }`}>
                                            {item.type}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-0.5 mt-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} size={12} className={s <= item.rating ? "fill-amber-400 text-amber-400" : "text-slate-100"} />
                                        ))}
                                    </div>
                                </div>

                                {/* Center: Content */}
                                <div className="flex-grow flex flex-col gap-4">
                                    <div className="bg-slate-50/50 p-4 rounded-sm border border-border/50 relative">
                                        <MessageSquare size={16} className="absolute -left-2 -top-2 text-slate-200 bg-white" />
                                        <p className="text-xs font-medium text-slate-700 leading-relaxed">
                                            {item.comment}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <UserCircle size={14} className="text-secondary" />
                                            <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Logged By: @{item.recordedBy}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-secondary" />
                                            <span className="text-[9px] font-black text-secondary uppercase tracking-widest">{new Date(item.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric'})}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="ml-auto flex items-start gap-2">
                                    <button 
                                        onClick={() => handleDelete(item._id)}
                                        disabled={deleteLoading === item._id}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-sm transition-all"
                                        title="Expunge Record"
                                    >
                                        {deleteLoading === item._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Placeholder */}
            {filteredFeedback.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 bg-muted border border-border rounded-sm mt-4">
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest">End of intelligence registry</span>
                    <div className="flex items-center gap-4">
                        <button className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1 cursor-not-allowed">
                            <ChevronLeft size={12} /> Previous
                        </button>
                        <span className="h-6 w-6 bg-primary text-white text-[10px] flex items-center justify-center font-bold rounded-sm shadow-sm">1</span>
                        <button className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1 cursor-not-allowed">
                            Next <ChevronRight size={12} />
                        </button>
                    </div>
                </div>
            )}

            <FeedbackModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchFeedback} 
            />
        </div>
    );
}
