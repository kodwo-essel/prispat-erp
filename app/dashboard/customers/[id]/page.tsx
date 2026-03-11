"use client";

import { use } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    UserCircle2,
    MapPin,
    Calendar,
    ShoppingCart,
    CreditCard,
    History,
    TrendingUp,
    Mail,
    Phone,
    Edit,
    ExternalLink,
    ShieldCheck,
    Star
} from "lucide-react";

export default function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    // Mock specific customer profile data
    const customer = {
        id: id,
        name: "Green Valley Cooperatives",
        type: "Retailer (Tier 1)",
        location: "Sunyani Region, West District",
        contactName: "Kwame Asare",
        phone: "+233 24 992 0011",
        email: "kwame.asare@gvcoop.gh",
        creditLimit: "$15,000.00",
        balance: "$4,250.00",
        since: "May 2024",
        status: "Active",
        rating: 4.8
    };

    const salesHistory = [
        { id: "INV-2901", date: "2026-03-05", amount: "$1,200.00", status: "Paid", items: "Fertilizer (Bulk)" },
        { id: "INV-2844", date: "2026-02-15", amount: "$3,050.00", status: "Overdue", items: "Pesticide Assortment" },
        { id: "INV-2780", date: "2026-01-20", amount: "$800.00", status: "Paid", items: "Safety Gear (PPE)" },
    ];

    return (
        <div className="flex flex-col gap-8">
            {/* Top Banner & Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <Link href="/dashboard/customers" className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors">
                        <ChevronLeft size={12} /> Back to Registry
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center text-primary">
                            <UserCircle2 size={40} />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-primary">{customer.name}</h1>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest">Premium</span>
                            </div>
                            <div className="flex items-center gap-4 text-secondary text-sm font-medium mt-1">
                                <span className="flex items-center gap-1"><MapPin size={14} /> {customer.location}</span>
                                <span className="flex items-center gap-1"><Calendar size={14} /> Partner since {customer.since}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 text-xs font-bold text-secondary border border-border px-4 py-2 rounded-sm hover:bg-slate-50 transition-colors uppercase tracking-wider">
                        <Edit size={14} /> Update Profile
                    </button>
                    <button className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        <ShoppingCart size={14} /> New Order
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Metrics & History */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                            <div className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Accounts Receivable</div>
                            <div className="text-2xl font-black text-primary tabular-nums">{customer.balance}</div>
                            <div className="mt-2 h-1 bg-red-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 w-[28%]" />
                            </div>
                        </div>
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                            <div className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Credit Utilization</div>
                            <div className="text-2xl font-black text-primary tabular-nums">35%</div>
                            <div className="text-[10px] text-secondary font-bold mt-1">Limit: {customer.creditLimit}</div>
                        </div>
                        <div className="bg-white border border-border p-5 rounded-sm shadow-sm">
                            <div className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Reliability Index</div>
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-black text-primary">A+</div>
                                <div className="h-6 w-px bg-border" />
                                <div className="flex items-center gap-0.5 text-yellow-500">
                                    <Star size={12} fill="currentColor" /> {customer.rating}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sales Record Ledger */}
                    <section className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-muted px-6 py-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History size={16} className="text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Transaction History</h3>
                            </div>
                            <button className="text-[10px] font-black text-primary uppercase hover:underline">Full Statement</button>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border text-[10px] text-secondary font-bold uppercase">
                                    <th className="px-6 py-3">Invoiced On</th>
                                    <th className="px-6 py-3">Ref ID</th>
                                    <th className="px-6 py-3">Purchase Subject</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {salesHistory.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-xs font-medium tabular-nums">{sale.date}</td>
                                        <td className="px-6 py-4 text-[11px] font-bold text-primary">{sale.id}</td>
                                        <td className="px-6 py-4 text-xs text-secondary">{sale.items}</td>
                                        <td className="px-6 py-4 font-black text-primary tabular-nums">{sale.amount}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${sale.status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                                                }`}>{sale.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>

                {/* Right Column: Contact & Metadata */}
                <div className="flex flex-col gap-6">
                    <section className="bg-slate-900 text-white p-6 rounded-sm shadow-lg flex flex-col gap-6">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                            <TrendingUp size={18} className="text-primary" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/80">Account Manager View</h3>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Territory Liaison</span>
                                <span className="text-sm font-bold">Mr. Kwame Asare</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button className="flex items-center gap-3 w-full bg-white/5 hover:bg-white/10 p-3 rounded-sm transition-all border border-white/10 group">
                                    <Mail size={16} className="text-primary opacity-60 group-hover:opacity-100" />
                                    <span className="text-xs font-medium truncate">{customer.email}</span>
                                </button>
                                <button className="flex items-center gap-3 w-full bg-white/5 hover:bg-white/10 p-3 rounded-sm transition-all border border-white/10 group">
                                    <Phone size={16} className="text-primary opacity-60 group-hover:opacity-100" />
                                    <span className="text-xs font-medium">{customer.phone}</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    <div className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck size={16} className="text-green-600" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-secondary">Verified Credentials</h3>
                        </div>
                        <ul className="flex flex-col gap-3">
                            <li className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-secondary opacity-70">Business License</span>
                                <span className="text-primary flex items-center gap-1">Validated <ExternalLink size={10} /></span>
                            </li>
                            <li className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-secondary opacity-70">VAT Reg ID</span>
                                <span className="text-primary">GH-2900-11X</span>
                            </li>
                            <li className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-secondary opacity-70">Credit Protocol</span>
                                <span className="text-primary">Standard 30D</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
