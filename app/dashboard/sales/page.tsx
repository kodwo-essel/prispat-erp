"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    ShoppingBag,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Calendar,
    User
} from "lucide-react";

export default function SalesPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch("/api/orders");
                const json = await res.json();
                if (json.success) {
                    setOrders(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order =>
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Sales & Distribution Dispatch</h1>
                    <p className="text-sm text-secondary mt-1">Authorized tracking of outbound customer orders and delivery fulfillment.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/sales/new" className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider font-bold">
                        <Plus size={14} /> Dispatch New Order
                    </Link>
                </div>
            </div>

            {/* Metrics Overview (Mini) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-border p-4 rounded-sm">
                    <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Total Dispatches Today</div>
                    <div className="text-xl font-bold text-primary">{orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length}</div>
                </div>
                <div className="bg-white border border-border p-4 rounded-sm">
                    <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Pending Orders</div>
                    <div className="text-xl font-bold text-amber-600">{orders.filter(o => o.status === 'Pending').length}</div>
                </div>
                <div className="bg-white border border-border p-4 rounded-sm">
                    <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Aggregate Revenue (MTD)</div>
                    <div className="text-xl font-bold text-primary">₵{orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}</div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white border border-border p-4 rounded-sm flex items-center justify-between gap-4">
                <div className="relative flex-grow max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Customer Name..."
                        className="bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="text-xs text-secondary font-medium tracking-tight">Accessing Live Order Registry</div>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                {loading ? (
                    <div className="flex-grow flex flex-col items-center justify-center gap-4 text-slate-400">
                        <Loader2 size={32} className="animate-spin text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest">Accessing Distribution Logs...</span>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center gap-4 text-slate-400">
                        <ShoppingBag size={48} className="opacity-20" />
                        <span className="text-sm font-medium">No sales records found in current batch.</span>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted border-b border-border">
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Order ID</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Customer Entity</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Manifest Summary</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Total Value</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Dispatch Date</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Status</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-bold text-primary tabular-nums">{order.orderId}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <User size={12} className="text-secondary opacity-50" />
                                            <div className="text-xs font-bold text-slate-900">{order.customer.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-secondary font-medium">
                                            {order.items.length} Product Line Items
                                        </div>
                                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                                            {order.items.map((i: any) => i.name).join(", ")}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-black text-slate-900 tabular-nums">₵{order.totalAmount.toLocaleString()}</div>
                                        <div className="text-[10px] text-secondary uppercase font-bold tracking-tighter">Settled</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs text-secondary">
                                            <Calendar size={12} className="opacity-50" />
                                            {new Date(order.dispatchDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight ${order.status === 'Dispatched' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                                            Manage <ArrowRight size={10} className="inline ml-1" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination Placeholder */}
                <div className="px-6 py-3 bg-muted border-t border-border flex items-center justify-between mt-auto">
                    <div className="text-[10px] text-secondary">Audit Trail active: Every dispatch records operator identity.</div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-not-allowed">
                            <ChevronLeft size={12} /> Previous
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="h-6 w-6 bg-primary text-white text-[10px] flex items-center justify-center font-bold rounded-sm shadow-sm">1</span>
                        </div>
                        <button className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-not-allowed">
                            Next <ChevronRight size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
