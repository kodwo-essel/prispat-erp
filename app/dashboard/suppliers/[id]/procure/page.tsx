"use client";

import { use } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    ShoppingCart,
    CreditCard,
    Calendar,
    Truck,
    FileText,
    AlertCircle,
    ShieldCheck,
    Send
} from "lucide-react";

export default function ProcurementPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    // Mock supplier data
    const supplier = {
        id: id,
        name: "AgroGen Hub",
        category: "General Chemicals",
        rating: "98%",
        status: "Priority Vendor"
    };

    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            {/* Breadcrumb & Header */}
            <div className="flex flex-col gap-4">
                <Link href="/dashboard/suppliers" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors w-fit">
                    <ChevronLeft size={12} /> Back to Directory
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Initiate Procurement</h1>
                        <p className="text-secondary text-sm">Purchase Order Request for <span className="text-primary font-black uppercase">{supplier.name}</span></p>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-sm">
                        <ShieldCheck size={16} className="text-green-600" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-green-700 uppercase leading-none">Verified Vendor</span>
                            <span className="text-[8px] text-green-600 font-bold uppercase tracking-tighter">Approved for Tier-1 Orders</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Order Details */}
                <div className="md:col-span-2 flex flex-col gap-6">
                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
                            <ShoppingCart size={18} className="text-primary" />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Order Specifications</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Inventory Item Selection</label>
                                <select className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary">
                                    <option>Select product to procure...</option>
                                    <option>Glyphosate 480SL (Herbicide)</option>
                                    <option>Paraquat-Dichloride (Herbicide)</option>
                                    <option>Urea 46% N (Fertilizer)</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Order Quantity</label>
                                <div className="flex">
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="w-full bg-muted border border-border border-r-0 px-4 py-2 rounded-l-sm text-sm focus:outline-none focus:border-primary"
                                    />
                                    <div className="bg-slate-100 border border-border px-3 py-2 rounded-r-sm text-[10px] font-bold uppercase text-secondary flex items-center">
                                        Units
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Negotiated Unit Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-xs font-bold">$</span>
                                    <input
                                        type="text"
                                        placeholder="0.00"
                                        className="w-full bg-muted border border-border pl-7 pr-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Funding Allocation Code</label>
                                <input
                                    type="text"
                                    placeholder="e.g. BDG-2026-HUB"
                                    className="w-full bg-muted border border-border px-4 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Requested Delivery Date</label>
                                <div className="relative">
                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary opacity-50" />
                                    <input
                                        type="date"
                                        className="w-full bg-muted border border-border px-9 py-2 rounded-sm text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText size={16} className="text-secondary" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-secondary">Procurement Authorization Note</h3>
                        </div>
                        <textarea
                            placeholder="Official justification for this purchase order..."
                            className="w-full bg-muted border border-border p-4 rounded-sm text-sm min-h-[120px] focus:outline-none focus:border-primary"
                        />
                    </section>
                </div>

                {/* Totals & Summary */}
                <div className="flex flex-col gap-6">
                    <section className="bg-slate-900 text-white p-6 rounded-sm shadow-lg flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                            <CreditCard size={18} className="text-primary" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest">Financial Summary</h3>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between text-xs">
                                <span className="opacity-60">Subtotal</span>
                                <span className="font-bold tabular-nums">$0.00</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="opacity-60">National Levy (2%)</span>
                                <span className="font-bold tabular-nums">$0.00</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="opacity-60">Delivery Charges</span>
                                <span className="font-bold tabular-nums">$0.00</span>
                            </div>
                            <div className="h-px bg-white/10 my-2" />
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black uppercase text-primary">Total Est. Cost</span>
                                <span className="text-2xl font-black tabular-nums text-white">$0.00</span>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-4 rounded-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Truck size={14} className="text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Lead Time Impact</span>
                            </div>
                            <p className="text-[10px] text-white/40 leading-relaxed italic">
                                Bulk orders from this vendor typically arrive within 4-6 business days to the Central Distribution Node.
                            </p>
                        </div>
                    </section>

                    <div className="bg-orange-50 border border-orange-200 p-5 rounded-sm flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-orange-700">
                            <AlertCircle size={16} />
                            <h3 className="text-xs font-black uppercase tracking-widest">Authorization Required</h3>
                        </div>
                        <p className="text-[10px] text-orange-800 font-medium">
                            Orders above $50,000.00 require secondary approval from the Provincial Director.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-4 border-t border-border pt-8 mt-4">
                <button className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest px-6 py-2.5 rounded-sm hover:bg-muted transition-colors">
                    Save as Draft
                </button>
                <button className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-8 py-2.5 rounded-sm">
                    <Send size={14} /> Dispatch Order Request
                </button>
            </div>
        </div>
    );
}
