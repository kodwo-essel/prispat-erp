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
    User,
    CheckCircle,
    XCircle,
    Trash2,
    Truck,
    FileText,
    ExternalLink
} from "lucide-react";
import ConfirmationModal from "@/app/dashboard/components/ConfirmationModal";
import OrderManageDrawer from "./OrderManageDrawer";
import TablePagination from "@/app/dashboard/components/TablePagination";

export default function SalesPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [typeFilter, setTypeFilter] = useState<"All" | "Credit" | "Cash">("All");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText: string;
        type: "danger" | "warning" | "info";
        onConfirm: () => void;
        isLoading?: boolean;
    }>({
        isOpen: false,
        title: "",
        message: "",
        confirmText: "Confirm",
        type: "info",
        onConfirm: () => { },
    });

    const fetchOrders = async () => {
        try {
            setLoading(true);
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

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateOrder = async (id: string, updates: any) => {
        setModalConfig({
            isOpen: true,
            title: `Update Order Information`,
            message: `Are you sure you want to commit these changes to the order record?`,
            confirmText: `Commit Changes`,
            type: "info",
            isLoading: false,
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, isLoading: true }));
                try {
                    const res = await fetch(`/api/orders/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updates)
                    });
                    const json = await res.json();
                    if (json.success) {
                        fetchOrders();
                        setModalConfig(prev => ({ ...prev, isOpen: false }));
                        setIsDrawerOpen(false);
                    } else {
                        setModalConfig({
                            isOpen: true,
                            title: "Update Failed",
                            message: json.error || "Failed to update order.",
                            confirmText: "Close",
                            type: "danger",
                            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                        });
                    }
                } catch (error) {
                    console.error("Update failed:", error);
                } finally {
                    setModalConfig(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };

    const handleCancelOrder = async (id: string) => {
        setModalConfig({
            isOpen: true,
            title: "Cancel Order",
            message: "Are you sure you want to cancel this order? This will restock inventory and mark the record as inactive.",
            confirmText: "Cancel Order",
            type: "danger",
            isLoading: false,
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, isLoading: true }));
                try {
                    const res = await fetch(`/api/orders/${id}`, {
                        method: "DELETE"
                    });
                    const json = await res.json();
                    if (json.success) {
                        fetchOrders();
                        setModalConfig(prev => ({ ...prev, isOpen: false }));
                        setIsDrawerOpen(false); // Close drawer if it was open
                    } else {
                        setModalConfig({
                            isOpen: true,
                            title: "Cancellation Failed",
                            message: json.error || "Failed to cancel order.",
                            confirmText: "Close",
                            type: "danger",
                            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                        });
                    }
                } catch (error) {
                    console.error("Cancellation failed:", error);
                } finally {
                    setModalConfig(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };

    const handleOpenDrawer = (order: any) => {
        setSelectedOrder(order);
        setIsDrawerOpen(true);
    };

    // Metric Calculations
    const todayISO = new Date().toISOString().split('T')[0];

    const dispatchesToday = orders.filter(o => {
        try {
            const dateVal = o.dispatchDate || o.createdAt;
            if (!dateVal) return false;
            const d = new Date(dateVal).toISOString().split('T')[0];
            return d === todayISO && o.status !== 'Cancelled';
        } catch (e) {
            return false;
        }
    }).length;

    const totalDispatches = orders.filter(o => o.status !== 'Cancelled').length;

    const pendingOrders = orders.filter(o => o.status === 'Pending').length;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const mtdRevenue = orders.reduce((sum, o) => {
        const d = new Date(o.createdAt);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear && o.status !== 'Cancelled') {
            return sum + o.totalAmount;
        }
        return sum;
    }, 0);

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
        const saleType = order.saleType || "Credit";
        const matchesType = typeFilter === "All" || saleType === typeFilter;
        return matchesSearch && matchesType;
    });

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, typeFilter]);

    const totalPages = Math.ceil(filteredOrders.length / pageSize);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
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
                        <Plus size={14} /> Record New Sale
                    </Link>
                </div>
            </div>

            {/* Metrics Overview (Mini) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-border p-4 rounded-sm">
                    <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Total Sales Today</div>
                    <div className="text-xl font-bold text-primary">{dispatchesToday}</div>
                </div>
                <div className="bg-white border border-border p-4 rounded-sm">
                    <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Total Sales</div>
                    <div className="text-xl font-bold text-primary">{totalDispatches}</div>
                </div>
                <div className="bg-white border border-border p-4 rounded-sm">
                    <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Pending Orders</div>
                    <div className="text-xl font-bold text-amber-600">{pendingOrders}</div>
                </div>
                <div className="bg-white border border-border p-4 rounded-sm">
                    <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Aggregate Revenue (MTD)</div>
                    <div className="text-xl font-bold text-primary">₵{mtdRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white border border-border p-4 rounded-sm flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="relative flex-grow max-w-sm w-full">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Customer Name..."
                        className="bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest hidden lg:block">Filter Mode:</span>
                    <div className="flex bg-muted p-1 rounded-sm border border-border">
                        {(["All", "Credit", "Cash"] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${typeFilter === type ? "bg-white text-primary shadow-sm border border-border" : "text-secondary hover:text-primary"}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
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
                                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-center">#</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Order ID</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Customer Entity</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Total Value</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Date</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Status</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Sale Type</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Ref / Invoice</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paginatedOrders.map((order, index) => (
                                <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-slate-400 tabular-nums">{(currentPage - 1) * pageSize + index + 1}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-primary tabular-nums">{order.orderId}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-bold text-slate-900">
                                            {order.customer.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-black text-slate-900 tabular-nums">₵{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                        <div className="text-[10px] text-secondary uppercase font-bold tracking-tighter">Settled</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="text-xs text-secondary font-bold tabular-nums">
                                            {new Date(order.dispatchDate || order.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter border ${order.status === 'Delivered' || order.status === 'Received' ? 'bg-green-50 text-green-600 border-green-200' :
                                            order.status === 'Dispatched' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                                order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-200' :
                                                    'bg-slate-50 text-slate-500 border border-slate-200'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-tighter border ${order.saleType === 'Cash' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                            {order.saleType || "Credit"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {order.txId ? (
                                            <Link
                                                href={`/dashboard/invoices/${order.txId}`}
                                                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                            >
                                                {order.txId} <ExternalLink size={12} />
                                            </Link>
                                        ) : (
                                            <span className="text-[10px] text-slate-300 italic uppercase">No Link</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleOpenDrawer(order)}
                                            className="inline-flex items-center justify-end gap-1 text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                                        >
                                            Manage <ArrowRight size={10} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalRecords={filteredOrders.length}
                    pageSize={pageSize}
                />
            </div>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                type={modalConfig.type}
                isLoading={modalConfig.isLoading}
            />

            <OrderManageDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                order={selectedOrder}
                onUpdateOrder={handleUpdateOrder}
                onCancelOrder={handleCancelOrder}
            />
        </div>
    );
}
