"use client";

import { useState, useEffect } from "react";
import {
    Calendar,
    ChevronRight,
    FileText,
    Download,
    Printer,
    Check,
    Package,
    Truck,
    History,
    Users,
    ShoppingBag,
    UserCircle,
    CircleDollarSign,
    Loader2,
    BarChart3
} from "lucide-react";

import ReportPrintView from "./components/ReportPrintView";

const services = [
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "suppliers", label: "Suppliers", icon: Truck },
    { id: "supplies", label: "Supplies", icon: History },
    { id: "customers", label: "Customers", icon: Users },
    { id: "sales", label: "Sales & Dispatch", icon: ShoppingBag },
    { id: "staff", label: "Staff", icon: UserCircle },
    { id: "finance", label: "Finance & Ledger", icon: CircleDollarSign },
];

export default function ReportsPage() {
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [showPrintView, setShowPrintView] = useState(false);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        fetch("/api/settings")
            .then(res => res.json())
            .then(json => {
                if (json.success) setSettings(json.data);
            });
    }, []);

    const toggleService = (id: string) => {
        setSelectedServices(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const generateReport = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch("/api/dashboard/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startDate,
                    endDate,
                    services: selectedServices
                })
            });
            const json = await res.json();
            if (json.success) {
                setReportData(json.data);
            }
        } catch (error) {
            console.error("Failed to generate report:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-20">
            <div>
                <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                <p className="text-sm text-secondary mt-1">Generate comprehensive intelligence reports across all ecosystem parameters.</p>
            </div>

            {!reportData ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Selection Panel */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-white border border-border rounded-sm p-8 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-primary mb-8 flex items-center gap-3">
                                <Calendar size={16} /> Configuration Parameters
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-muted border border-border rounded-sm px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-muted border border-border rounded-sm px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase text-secondary tracking-widest">Target Ecosystem Services</label>
                                    <button
                                        onClick={() => setSelectedServices(prev => prev.length === services.length ? [] : services.map(s => s.id))}
                                        className="text-[10px] font-black uppercase text-[#002d62] tracking-widest hover:underline"
                                    >
                                        {selectedServices.length === services.length ? "Deselect All" : "Select All"}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {services.map((service) => (
                                        <button
                                            key={service.id}
                                            onClick={() => toggleService(service.id)}
                                            className={`flex items-center justify-between p-4 rounded-sm border transition-all duration-200 ${selectedServices.includes(service.id)
                                                ? "bg-primary/5 border-primary text-primary"
                                                : "bg-white border-border text-secondary hover:border-slate-300"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <service.icon size={16} className={selectedServices.includes(service.id) ? "opacity-100" : "opacity-40"} />
                                                <span className="text-xs font-bold uppercase tracking-tight">{service.label}</span>
                                            </div>
                                            {selectedServices.includes(service.id) && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-border flex justify-end">
                                <button
                                    onClick={generateReport}
                                    disabled={isGenerating || selectedServices.length === 0}
                                    className="btn-primary flex items-center gap-3 px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span className="text-xs font-black uppercase tracking-widest">Compiling Data...</span>
                                        </>
                                    ) : (
                                        <>
                                            <BarChart3 size={16} />
                                            <span className="text-xs font-black uppercase tracking-widest">Generate Master Report</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Info */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-primary text-white rounded-sm p-8 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <FileText size={80} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-4">Report Engine v2.4</h4>
                                <p className="text-sm font-bold leading-relaxed">
                                    Our cross-service reporting engine aggregates real-time data from all warehouse nodes, sales terminals, and financial ledgers.
                                </p>
                                <div className="mt-8 flex flex-col gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check size={10} />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-tight opacity-80">Print-Ready Formatting</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check size={10} />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-tight opacity-80">Full Audit Traceability</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check size={10} />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-tight opacity-80">Data-Driven Insights</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Report Header Controls */}
                    <div className="flex items-center justify-between print:hidden">
                        <button
                            onClick={() => setReportData(null)}
                            className="text-[10px] font-black uppercase tracking-widest text-secondary hover:text-[#002d62] transition-colors flex items-center gap-2"
                        >
                            <ChevronRight size={14} className="rotate-180" /> Back to Parameters
                        </button>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowPrintView(true)}
                                className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-6"
                            >
                                <Download size={14} /> Export PDF
                            </button>
                        </div>
                    </div>

                    {showPrintView && (
                        <ReportPrintView
                            reportData={reportData}
                            startDate={startDate}
                            endDate={endDate}
                            selectedServices={selectedServices}
                            onClose={() => setShowPrintView(false)}
                        />
                    )}

                    {/* Report Content */}
                    <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden p-12 print:border-0 print:shadow-none print:p-0">
                        <div className="border-b-2 border-primary pb-8 mb-10 flex justify-between items-start">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-3xl font-black text-primary uppercase tracking-tighter">System Intelligence Report</h2>
                                <div className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">
                                    Report Period: {new Date(startDate).toLocaleDateString()} — {new Date(endDate).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black text-secondary uppercase tracking-widest">Generated On</div>
                                <div className="text-sm font-bold text-primary">{new Date().toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-12">
                            {selectedServices.map(serviceId => {
                                const service = services.find(s => s.id === serviceId);
                                const data = reportData[serviceId];
                                if (!data || !service) return null;

                                return (
                                    <section key={serviceId} className="flex flex-col gap-6">
                                        <div className="flex items-center gap-3 border-b border-border pb-2">
                                            <service.icon size={18} className="text-primary" />
                                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">{service.label} Summary</h3>
                                        </div>

                                        {serviceId === 'finance' && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="bg-muted p-6 rounded-sm">
                                                    <div className="text-[9px] font-black text-secondary uppercase tracking-widest mb-1">Total Revenue</div>
                                                    <div className="text-2xl font-black text-green-600">₵{data.revenue?.toLocaleString()}</div>
                                                </div>
                                                <div className="bg-muted p-6 rounded-sm">
                                                    <div className="text-[9px] font-black text-secondary uppercase tracking-widest mb-1">Total Expenses</div>
                                                    <div className="text-2xl font-black text-red-600">₵{data.expenses?.toLocaleString()}</div>
                                                </div>
                                                <div className="bg-muted p-6 rounded-sm">
                                                    <div className="text-[9px] font-black text-secondary uppercase tracking-widest mb-1">Net Balance</div>
                                                    <div className="text-2xl font-black text-primary">₵{(data.revenue - data.expenses).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        )}

                                        {serviceId === 'inventory' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-muted p-6 rounded-sm">
                                                    <div className="text-[9px] font-black text-secondary uppercase tracking-widest mb-1">Active SKUs</div>
                                                    <div className="text-2xl font-black text-primary">{data.totalItems}</div>
                                                </div>
                                                <div className="bg-muted p-6 rounded-sm">
                                                    <div className="text-[9px] font-black text-secondary uppercase tracking-widest mb-1">Low Stock Alerts</div>
                                                    <div className="text-2xl font-black text-orange-600">{data.lowStock}</div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Dynamic Table for the service data */}
                                        <div className="border border-border rounded-sm overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-muted border-b border-border">
                                                    <tr>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary">Parameter</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary text-right">Magnitude</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {Object.entries(data.metrics || {}).map(([key, val]: [string, any]) => (
                                                        <tr key={key}>
                                                            <td className="px-6 py-4 text-xs font-bold text-primary uppercase">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                                                            <td className="px-6 py-4 text-xs font-bold text-right tabular-nums">{val.toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                );
                            })}
                        </div>

                        <div className="mt-20 pt-10 border-t border-border flex justify-between items-end opacity-40">
                            <div className="flex flex-col gap-2">
                                <span className="text-[8px] font-black uppercase tracking-widest text-secondary">Internal Verification Protocol</span>
                                <p className="text-[8px] text-secondary max-w-xs leading-relaxed">
                                    This report is generated by the GH-ACCRA core ERP intelligence engine. All values are reconciled against the primary system ledger. Unauthorized duplication is prohibited.
                                </p>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="h-8 w-8 rounded-sm bg-white border border-border flex items-center justify-center p-1 overflow-hidden">
                                    <img
                                        src={settings?.logoUrl || "/images/logo.jpeg"}
                                        alt="Logo"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "/images/logo.jpeg";
                                        }}
                                    />
                                </div>
                                <span className="text-[8px] font-black uppercase text-primary">Certified Record</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
