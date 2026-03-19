"use client";

import React, { useState, useEffect } from "react";
import {
    X,
    User,
    Package,
    Calendar,
    Clock,
    CheckCircle,
    ArrowRight,
    XCircle,
    Printer,
    ExternalLink,
    AlertCircle,
    Truck,
    Edit2,
    Save,
    FileText
} from "lucide-react";
import Link from "next/link";

interface OrderManageDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    order: any | null;
    onUpdateOrder: (id: string, updates: any) => void;
    onCancelOrder: (id: string) => void;
}

const OrderManageDrawer: React.FC<OrderManageDrawerProps> = ({
    isOpen,
    onClose,
    order,
    onUpdateOrder,
    onCancelOrder,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editDispatchDate, setEditDispatchDate] = useState("");

    useEffect(() => {
        if (order) {
            try {
                const dateVal = order.dispatchDate || order.createdAt || new Date();
                setEditDispatchDate(new Date(dateVal).toISOString().split('T')[0]);
            } catch (e) {
                setEditDispatchDate(new Date().toISOString().split('T')[0]);
            }
        }
        setIsEditing(false);
    }, [order]);

    if (!isOpen || !order) return null;

    const statusColors: any = {
        Pending: "bg-amber-50 text-amber-600 border-amber-100",
        Dispatched: "bg-blue-50 text-blue-600 border-blue-100",
        Delivered: "bg-green-50 text-green-600 border-green-100",
        Received: "bg-green-50 text-green-600 border-green-100",
        Cancelled: "bg-red-50 text-red-600 border-red-100",
    };

    const handleSave = () => {
        onUpdateOrder(order._id, {
            dispatchDate: editDispatchDate
        });
        setIsEditing(false);
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-1">Dispatch Manager</div>
                        <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                            {order.orderId}
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-tight border ${order.saleType === 'Cash' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                {order.saleType || "Credit"}
                            </span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isEditing && order.status !== 'Cancelled' && order.saleType !== 'Cash' && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 hover:bg-muted rounded-full transition-colors text-primary"
                                title="Edit Dispatch Details"
                            >
                                <Edit2 size={18} />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-muted rounded-full transition-colors"
                        >
                            <X size={20} className="text-secondary" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6 space-y-8">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColors[order.status] || "bg-slate-50 text-slate-500"}`}>
                            {order.status}
                        </span>
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1">
                            <Clock size={12} /> Last Modified: {new Date(order.updatedAt || order.createdAt).toLocaleTimeString()}
                        </div>
                    </div>

                    {/* Customer Info (Non-editable) */}
                    <section className="space-y-3 font-medium">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary">
                            <User size={14} /> Consignee Information
                        </div>
                        <div className="bg-muted/30 p-4 rounded-sm border border-border">
                            <div className="font-bold text-primary">{order.customer.name}</div>
                            <div className="text-[10px] text-secondary uppercase tracking-tighter mt-1">Registry ID: {order.customer.id || "Walk-in"}</div>
                        </div>
                    </section>

                    {/* Logistics Audit / Date */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary">
                            <Calendar size={14} /> Dispatch Schedule
                        </div>
                        <div className="bg-muted/30 p-4 rounded-sm border border-border">
                            {order.saleType === 'Cash' ? (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-bold text-green-600">Immediate Fulfillment</div>
                                        <div className="text-[10px] text-secondary uppercase tracking-tighter mt-1">Direct Shop Floor Transaction</div>
                                    </div>
                                    <CheckCircle size={24} className="text-green-200" />
                                </div>
                            ) : isEditing ? (
                                <div key="edit-date" className="space-y-2">
                                    <label className="text-[10px] font-bold text-secondary uppercase">Effective Dispatch Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-white border border-border p-2 rounded-sm text-xs focus:outline-none focus:border-primary font-bold"
                                        value={editDispatchDate}
                                        onChange={(e) => setEditDispatchDate(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div key="view-date" className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-bold text-primary">{new Date(order.dispatchDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                                        <div className="text-[10px] text-secondary uppercase tracking-tighter mt-1">Confirmed Logistics Window</div>
                                    </div>
                                    <Truck size={24} className="text-slate-200" />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Financial Linkage */}
                    {order.txId && (
                        <section className="space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary">
                                <FileText size={14} /> Linked Financial Record
                            </div>
                            <div className="bg-primary/5 p-4 rounded-sm border border-primary/20 flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold text-primary">{order.txId}</div>
                                    <div className="text-[10px] text-secondary uppercase tracking-tighter mt-1">Official Claim Invoice</div>
                                </div>
                                <Link
                                    href={`/dashboard/invoices/${order.txId}`}
                                    className="p-2 bg-white border border-primary/20 rounded-sm hover:bg-primary/5 transition-colors text-primary"
                                    title="View Full Invoice"
                                >
                                    <ExternalLink size={16} />
                                </Link>
                            </div>
                        </section>
                    )}

                    {/* Order Manifest (Non-editable) */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary">
                            <Package size={14} /> Cargo Manifest
                        </div>
                        <div className="border border-border rounded-sm overflow-hidden opacity-80 bg-slate-50/50">
                            <table className="w-full text-left">
                                <thead className="bg-muted text-[10px] font-bold uppercase text-secondary">
                                    <tr>
                                        <th className="px-4 py-2">Item Details</th>
                                        <th className="px-4 py-2 text-right">Qty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {order.items.map((item: any, idx: number) => (
                                        <tr key={idx} className="text-xs">
                                            <td className="px-4 py-3">
                                                <div className="font-bold">{item.name}</div>
                                                <div className="text-[10px] text-secondary">SKU: {item.sku} | Batch: {item.batchId}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold tabular-nums">
                                                {item.quantity} {item.unit || "unit(s)"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-muted/50 border-t border-border font-bold">
                                    <tr className="text-xs">
                                        <td className="px-4 py-3 uppercase tracking-wider text-secondary">Total Value</td>
                                        <td className="px-4 py-3 text-right text-primary tabular-nums text-sm">₵{order.totalAmount.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded-sm border border-amber-100 flex items-center gap-2">
                            <AlertCircle size={12} /> Line items cannot be modified after initial dispatch recording.
                        </div>
                    </section>
                </div>

                {/* Actions Footer */}
                <div className="p-6 bg-muted/30 border-t border-border space-y-3">
                    {isEditing ? (
                        <div key="actions-editing" className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex items-center justify-center gap-2 border border-border bg-white hover:bg-slate-50 text-secondary font-bold py-3 px-4 rounded-sm text-xs uppercase tracking-widest transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-sm text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20"
                            >
                                <Save size={14} /> Save Changes
                            </button>
                        </div>
                    ) : (
                        <div key="actions-viewing" className="grid grid-cols-2 gap-3">
                            {order.status === 'Pending' && (
                                <button
                                    onClick={() => onUpdateOrder(order._id, { status: 'Dispatched' })}
                                    className="col-span-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-sm text-xs uppercase tracking-widest transition-all active:scale-95"
                                >
                                    <ArrowRight size={14} /> Authorize Dispatch
                                </button>
                            )}
                            {order.status === 'Dispatched' && (
                                <button
                                    onClick={() => onUpdateOrder(order._id, { status: 'Delivered' })}
                                    className="col-span-2 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-sm text-xs uppercase tracking-widest transition-all active:scale-95"
                                >
                                    <CheckCircle size={14} /> Confirm Delivery
                                </button>
                            )}
                            <button className="flex items-center justify-center gap-2 border border-border bg-white hover:bg-slate-50 text-primary font-bold py-2.5 px-4 rounded-sm text-[10px] uppercase tracking-widest transition-all">
                                <Printer size={14} /> Duplicate Waybill
                            </button>
                            {order.status !== 'Cancelled' && order.status !== 'Delivered' ? (
                                <button
                                    onClick={() => onCancelOrder(order._id)}
                                    className="flex items-center justify-center gap-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-4 rounded-sm text-[10px] uppercase tracking-widest transition-all"
                                >
                                    <XCircle size={14} /> Revoke Order
                                </button>
                            ) : (
                                <button className="flex items-center justify-center gap-2 border border-border bg-white hover:bg-slate-50 text-secondary font-bold py-2.5 px-4 rounded-sm text-[10px] uppercase tracking-widest transition-all">
                                    <AlertCircle size={14} /> Incident Report
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderManageDrawer;
