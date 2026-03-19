"use client";

import { useState, useEffect } from "react";
import {
    MapPin,
    Calendar,
    FileText,
    ShieldCheck,
    Package,
    Truck,
    History,
    Users,
    ShoppingBag,
    UserCircle,
    CircleDollarSign
} from "lucide-react";

interface ReportPrintViewProps {
    reportData: any;
    startDate: string;
    endDate: string;
    selectedServices: string[];
    onClose: () => void;
}

const serviceIcons: Record<string, any> = {
    inventory: Package,
    suppliers: Truck,
    supplies: History,
    customers: Users,
    sales: ShoppingBag,
    staff: UserCircle,
    finance: CircleDollarSign,
};

const serviceLabels: Record<string, string> = {
    inventory: "Inventory",
    suppliers: "Suppliers",
    supplies: "Supplies",
    customers: "Customers",
    sales: "Sales & Dispatch",
    staff: "Staff",
    finance: "Finance & Ledger",
};

export default function ReportPrintView({ reportData, startDate, endDate, selectedServices, onClose }: ReportPrintViewProps) {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        fetch("/api/settings")
            .then(res => res.json())
            .then(json => {
                if (json.success) setSettings(json.data);
            });
    }, []);

    const biz = settings || {
        organizationName: "Prispat Prime Distribution",
        address: "Plot 42, Industrial Area, Kumasi, Ghana",
        email: "admin@prispat.com",
        phone: "+233 24 000 0000"
    };

    return (
        <div className="fixed inset-0 bg-white z-[100] overflow-y-auto p-12 print:p-0">
            <div className="max-w-4xl mx-auto flex flex-col gap-10">
                {/* Header Section */}
                <div className="flex justify-between items-start border-b-2 border-[#002d62] pb-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-white flex items-center justify-center rounded-sm border border-slate-200 overflow-hidden p-1 text-[#002d62]">
                                <img
                                    src={biz.logoUrl || "/images/logo.jpeg"}
                                    alt="Logo"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/images/logo.jpeg";
                                    }}
                                />
                            </div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter text-[#002d62]">{biz.organizationName}</h1>
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex flex-col gap-1">
                            <div className="flex items-center gap-2"><MapPin size={10} /> {biz.address}</div>
                            <div>Contact: {biz.phone} | {biz.email}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-black text-slate-200 uppercase tracking-tighter mb-2">INTELLIGENCE REPORT</h2>
                        <div className="text-sm font-bold text-[#002d62] uppercase tracking-widest">Master Audit Record</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            Period: {new Date(startDate).toLocaleDateString("en-GB")} - {new Date(endDate).toLocaleDateString("en-GB")}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-12">
                    {selectedServices.map(serviceId => {
                        const Icon = serviceIcons[serviceId] || FileText;
                        const label = serviceLabels[serviceId] || serviceId;
                        const data = reportData[serviceId];
                        if (!data) return null;

                        return (
                            <section key={serviceId} className="flex flex-col gap-6 break-inside-avoid">
                                <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                                    <Icon size={18} className="text-[#002d62]" />
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#002d62]">{label} Summary</h3>
                                </div>

                                {serviceId === 'finance' && (
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="bg-slate-50 p-6 rounded-sm border border-slate-100">
                                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Revenue</div>
                                            <div className="text-2xl font-black text-green-600">₵{(Number(data.revenue) || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-sm border border-slate-100">
                                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Expenses</div>
                                            <div className="text-2xl font-black text-red-600">₵{(Number(data.expenses) || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-sm border border-slate-100">
                                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Net Balance</div>
                                            <div className="text-2xl font-black text-[#002d62]">₵{((Number(data.revenue) || 0) - (Number(data.expenses) || 0)).toLocaleString()}</div>
                                        </div>
                                    </div>
                                )}

                                {serviceId === 'inventory' && (
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-slate-50 p-6 rounded-sm border border-slate-100">
                                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Active SKUs</div>
                                            <div className="text-2xl font-black text-[#002d62]">{(Number(data.totalItems) || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-sm border border-slate-100">
                                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Low Stock Alerts</div>
                                            <div className="text-2xl font-black text-orange-600">{(Number(data.lowStock) || 0).toLocaleString()}</div>
                                        </div>
                                    </div>
                                )}

                                <div className="border border-slate-200 rounded-sm overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Parameter</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Magnitude</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {Object.entries(data.metrics || {}).map(([key, val]: [string, any]) => (
                                                <tr key={key}>
                                                    <td className="px-6 py-4 text-xs font-bold text-slate-700 uppercase">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                                                    <td className="px-6 py-4 text-xs font-bold text-right tabular-nums text-[#002d62]">{(Number(val) || 0).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        );
                    })}
                </div>

                {/* Validation Section */}
                <div className="mt-20 pt-10 border-t-2 border-slate-200 flex justify-between items-end">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
                            <ShieldCheck size={12} /> Verification Protocol
                        </div>
                        <p className="text-[8px] text-slate-400 max-w-xs leading-relaxed italic">
                            Report generated by the GH-ACCRA core ERP intelligence engine.
                            Authenticated on {new Date().toLocaleString()} for administrative audit.
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center gap-1">
                            <div className="h-10 w-10 rounded-sm bg-white border border-slate-200 flex items-center justify-center p-1 overflow-hidden">
                                <img
                                    src={biz.logoUrl || "/images/logo.jpeg"}
                                    alt="Logo"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/images/logo.jpeg";
                                    }}
                                />
                            </div>
                            <span className="text-[7px] font-black uppercase text-slate-400">Certified</span>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-px bg-slate-300 w-48" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Authorized Signature</span>
                        </div>
                    </div>
                </div>

                {/* Print Controls (Hidden on Print) */}
                <div className="fixed bottom-8 right-8 flex gap-4 print:hidden">
                    <button
                        onClick={onClose}
                        className="bg-slate-800 text-white px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl"
                    >
                        Back to Portal
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="bg-[#002d62] text-white px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest transition-all shadow-xl shadow-[#002d62]/20 hover:brightness-110"
                    >
                        Confirm Print / PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
