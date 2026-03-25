"use client";

import { useState, useEffect } from "react";
import {
    Calendar,
    ChevronRight,
    FileText,
    Download,
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

const fmt = (n: number) =>
    n?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtInt = (n: number) => Math.round(n ?? 0).toLocaleString();

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

function KpiCard({ label, value, sub, color = "text-[#002d62]", highlight = false }: any) {
    return (
        <div className={`p-5 rounded-sm ${highlight ? "bg-[#002d62]" : "bg-muted"}`}>
            <div className={`text-[9px] font-black uppercase tracking-widest mb-2 ${highlight ? "text-white/60" : "text-secondary"}`}>{label}</div>
            <div className={`text-2xl font-black ${highlight ? "text-white" : color}`}>{value}</div>
            {sub && <div className={`text-[10px] font-bold mt-1 ${highlight ? "text-white/50" : "text-slate-400"}`}>{sub}</div>}
        </div>
    );
}

function SectionHeader({ icon: Icon, label }: any) {
    return (
        <div className="flex items-center gap-3 border-b border-border pb-3">
            <Icon size={18} className="text-[#002d62]" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#002d62]">{label} Summary</h3>
        </div>
    );
}

function BreakdownTable({ rows, col1, col2, isCurrency = false }: any) {
    if (!rows || rows.length === 0) return null;
    return (
        <div className="border border-border rounded-sm overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-muted border-b border-border">
                    <tr>
                        <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-secondary">{col1}</th>
                        <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-secondary text-right">{col2}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {rows.map((row: any, i: number) => {
                        const [k, v] = Object.values(row) as [string, number];
                        return (
                            <tr key={i} className="hover:bg-muted/40 transition-colors">
                                <td className="px-5 py-3 text-xs font-bold text-primary capitalize">{k}</td>
                                <td className="px-5 py-3 text-xs font-black text-right tabular-nums">
                                    {isCurrency ? `₵${fmt(v)}` : fmtInt(v)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default function ReportsPage() {
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [showPrintView, setShowPrintView] = useState(false);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        fetch("/api/settings")
            .then(res => res.json())
            .then(json => { if (json.success) setSettings(json.data); });
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
                body: JSON.stringify({ startDate, endDate, services: selectedServices })
            });
            const json = await res.json();
            if (json.success) setReportData(json.data);
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

                    {/* Sidebar */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-primary text-white rounded-sm p-8 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <FileText size={80} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-4">Report Engine v2.4</h4>
                                <p className="text-sm font-bold leading-relaxed">
                                    Cross-service reporting engine aggregating real-time data from all warehouse nodes, sales terminals, and financial ledgers.
                                </p>
                                <div className="mt-8 flex flex-col gap-4">
                                    {["Print-Ready Formatting", "Full Audit Traceability", "Data-Driven Insights"].map(item => (
                                        <div key={item} className="flex items-start gap-3">
                                            <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check size={10} />
                                            </div>
                                            <span className="text-[10px] uppercase font-bold tracking-tight opacity-80">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Controls */}
                    <div className="flex items-center justify-between print:hidden">
                        <button
                            onClick={() => setReportData(null)}
                            className="text-[10px] font-black uppercase tracking-widest text-secondary hover:text-[#002d62] transition-colors flex items-center gap-2"
                        >
                            <ChevronRight size={14} className="rotate-180" /> Back to Parameters
                        </button>
                        <button
                            onClick={() => setShowPrintView(true)}
                            className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-6"
                        >
                            <Download size={14} /> Export PDF
                        </button>
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

                    {/* Report Document */}
                    <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden p-12 print:border-0 print:shadow-none print:p-0">
                        {/* Doc Header */}
                        <div className="border-b-2 border-[#002d62] pb-8 mb-10 flex justify-between items-start">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-3xl font-black text-[#002d62] uppercase tracking-tighter">System Intelligence Report</h2>
                                <div className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">
                                    Period: {fmtDate(startDate)} — {fmtDate(endDate)}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black text-secondary uppercase tracking-widest">Generated On</div>
                                <div className="text-sm font-bold text-primary">{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-14">

                            {/* ── FINANCE ── */}
                            {reportData.finance && (
                                <section className="flex flex-col gap-6">
                                    <SectionHeader icon={CircleDollarSign} label="Finance & Ledger" />
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <KpiCard label="Total Revenue" value={`₵${fmt(reportData.finance.revenue)}`} color="text-emerald-600" />
                                        <KpiCard label="Total Outflows" value={`₵${fmt(reportData.finance.expenses)}`} color="text-red-600" />
                                        <KpiCard label="Net Balance" value={`₵${fmt(reportData.finance.net)}`} highlight color={reportData.finance.net >= 0 ? "text-emerald-400" : "text-red-400"} />
                                        <KpiCard label="Net Margin" value={`${reportData.finance.netMargin?.toFixed(1)}%`} sub="Profitability" color={reportData.finance.netMargin >= 0 ? "text-emerald-600" : "text-red-600"} />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <KpiCard label="Operating Ratio" value={`${reportData.finance.opRatio?.toFixed(1)}%`} sub="Cost efficiency" />
                                        <KpiCard label="Accounts Receivable" value={`₵${fmt(reportData.finance.accountsReceivable)}`} sub="Pending inflow" color="text-emerald-600" />
                                        <KpiCard label="Accounts Payable" value={`₵${fmt(reportData.finance.accountsPayable)}`} sub="Outstanding bills" color="text-red-600" />
                                        <KpiCard label="Transactions" value={fmtInt(reportData.finance.totalTransactions)} sub={`${reportData.finance.settledInvoices} settled · ${reportData.finance.pendingInvoices} pending`} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Expense Breakdown */}
                                        <div>
                                            <div className="text-[9px] font-black text-secondary uppercase tracking-widest mb-3">Outflow Breakdown</div>
                                            <div className="border border-border rounded-sm overflow-hidden">
                                                <table className="w-full text-left">
                                                    <tbody className="divide-y divide-border">
                                                        {[
                                                            { label: "Procurement Expenses", val: reportData.finance.expenseBreakdown?.procurement },
                                                            { label: "Payroll", val: reportData.finance.expenseBreakdown?.payroll },
                                                            { label: "Tax", val: reportData.finance.expenseBreakdown?.tax },
                                                        ].map(row => (
                                                            <tr key={row.label} className="hover:bg-muted/40">
                                                                <td className="px-5 py-3 text-xs font-bold text-primary">{row.label}</td>
                                                                <td className="px-5 py-3 text-xs font-black text-right tabular-nums">₵{fmt(row.val || 0)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        {/* Category breakdown */}
                                        {reportData.finance.expenseCategoryBreakdown?.length > 0 && (
                                            <div>
                                                <div className="text-[9px] font-black text-secondary uppercase tracking-widest mb-3">Expense by Category</div>
                                                <BreakdownTable
                                                    rows={reportData.finance.expenseCategoryBreakdown.map((r: any) => ({ category: r.category, amount: r.amount }))}
                                                    col1="Category" col2="Amount (₵)" isCurrency
                                                />
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* ── INVENTORY ── */}
                            {reportData.inventory && (
                                <section className="flex flex-col gap-6">
                                    <SectionHeader icon={Package} label="Inventory" />
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <KpiCard label="Active SKUs" value={fmtInt(reportData.inventory.totalItems)} />
                                        <KpiCard label="Total Asset Value" value={`₵${fmt(reportData.inventory.totalAssetValue)}`} highlight />
                                        <KpiCard label="Total Stock Units" value={fmtInt(reportData.inventory.totalStockUnits)} />
                                        <KpiCard label="Avg Unit Price" value={`₵${fmt(reportData.inventory.avgUnitPrice)}`} />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                                        <KpiCard label="Low Stock Items" value={fmtInt(reportData.inventory.lowStock)} sub="Below 100 units" color="text-orange-600" />
                                        <KpiCard label="Out of Stock" value={fmtInt(reportData.inventory.outOfStock)} sub="Zero units" color="text-red-600" />
                                    </div>
                                    {reportData.inventory.categoryBreakdown?.length > 0 && (
                                        <div>
                                            <div className="text-[9px] font-black text-secondary uppercase tracking-widest mb-3">Value by Category</div>
                                            <div className="border border-border rounded-sm overflow-hidden">
                                                <table className="w-full text-left">
                                                    <thead className="bg-muted border-b border-border">
                                                        <tr>
                                                            <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-secondary">Category</th>
                                                            <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-secondary text-center">SKUs</th>
                                                            <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-secondary text-right">Asset Value</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border">
                                                        {reportData.inventory.categoryBreakdown.map((row: any, i: number) => (
                                                            <tr key={i} className="hover:bg-muted/40">
                                                                <td className="px-5 py-3 text-xs font-bold text-primary capitalize">{row.category}</td>
                                                                <td className="px-5 py-3 text-xs font-bold text-center tabular-nums">{row.skus}</td>
                                                                <td className="px-5 py-3 text-xs font-black text-right tabular-nums">₵{fmt(row.value)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* ── SALES ── */}
                            {reportData.sales && (
                                <section className="flex flex-col gap-6">
                                    <SectionHeader icon={ShoppingBag} label="Sales & Dispatch" />
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <KpiCard label="Total Invoices" value={fmtInt(reportData.sales.totalInvoices)} />
                                        <KpiCard label="Gross Sales Value" value={`₵${fmt(reportData.sales.grossSalesValue)}`} highlight />
                                        <KpiCard label="Collected" value={`₵${fmt(reportData.sales.collectedValue)}`} color="text-emerald-600" />
                                        <KpiCard label="Outstanding" value={`₵${fmt(reportData.sales.outstandingValue)}`} color="text-red-600" />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <KpiCard label="Avg Order Value" value={`₵${fmt(reportData.sales.avgOrderValue)}`} />
                                        <KpiCard label="Settled Invoices" value={fmtInt(reportData.sales.settledCount)} color="text-emerald-600" />
                                        <KpiCard label="Collection Rate" value={`${reportData.sales.collectionRate?.toFixed(1)}%`} sub="Of gross billed" color={reportData.sales.collectionRate >= 80 ? "text-emerald-600" : "text-orange-600"} />
                                    </div>
                                </section>
                            )}

                            {/* ── SUPPLIES ── */}
                            {reportData.supplies && (
                                <section className="flex flex-col gap-6">
                                    <SectionHeader icon={History} label="Supplies" />
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <KpiCard label="Procurement Cycles" value={fmtInt(reportData.supplies.totalCycles)} />
                                        <KpiCard label="Total Procured" value={`₵${fmt(reportData.supplies.totalValue)}`} highlight />
                                        <KpiCard label="Settled Value" value={`₵${fmt(reportData.supplies.settledValue)}`} color="text-emerald-600" />
                                        <KpiCard label="Outstanding" value={`₵${fmt(reportData.supplies.outstandingValue)}`} color="text-red-600" />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <KpiCard label="Settled Cycles" value={fmtInt(reportData.supplies.settledCycles)} color="text-emerald-600" />
                                        <KpiCard label="Unpaid Cycles" value={fmtInt(reportData.supplies.unpaidCycles)} color="text-red-600" />
                                        <KpiCard label="Payment Rate" value={`${reportData.supplies.paymentRate?.toFixed(1)}%`} sub="Of total procured" color={reportData.supplies.paymentRate >= 80 ? "text-emerald-600" : "text-orange-600"} />
                                    </div>
                                </section>
                            )}

                            {/* ── SUPPLIERS ── */}
                            {reportData.suppliers && (
                                <section className="flex flex-col gap-6">
                                    <SectionHeader icon={Truck} label="Suppliers" />
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <KpiCard label="Total Suppliers" value={fmtInt(reportData.suppliers.totalSuppliers)} />
                                        <KpiCard label="Active" value={fmtInt(reportData.suppliers.activeSuppliers)} color="text-emerald-600" />
                                        <KpiCard label="On Hold" value={fmtInt(reportData.suppliers.onHoldSuppliers)} color="text-orange-600" />
                                        <KpiCard label="Inactive" value={fmtInt(reportData.suppliers.inactiveSuppliers)} color="text-red-600" />
                                    </div>
                                    {reportData.suppliers.countryBreakdown?.length > 0 && (
                                        <div>
                                            <div className="text-[9px] font-black text-secondary uppercase tracking-widest mb-3">By Country</div>
                                            <BreakdownTable
                                                rows={reportData.suppliers.countryBreakdown.map((r: any) => ({ country: r.country, count: r.count }))}
                                                col1="Country" col2="Suppliers"
                                            />
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* ── CUSTOMERS ── */}
                            {reportData.customers && (
                                <section className="flex flex-col gap-6">
                                    <SectionHeader icon={Users} label="Customers" />
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <KpiCard label="Total Customers" value={fmtInt(reportData.customers.totalCustomers)} />
                                        <KpiCard label="Active Accounts" value={fmtInt(reportData.customers.activeCustomers)} color="text-emerald-600" />
                                        <KpiCard label="Inactive" value={fmtInt(reportData.customers.inactiveCustomers)} color="text-red-600" />
                                        <KpiCard label="New in Period" value={fmtInt(reportData.customers.newRegistrations)} sub="Registrations" highlight />
                                    </div>
                                </section>
                            )}

                            {/* ── STAFF ── */}
                            {reportData.staff && (
                                <section className="flex flex-col gap-6">
                                    <SectionHeader icon={UserCircle} label="Staff" />
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <KpiCard label="Total Employees" value={fmtInt(reportData.staff.totalEmployees)} />
                                        <KpiCard label="Active" value={fmtInt(reportData.staff.activeEmployees)} color="text-emerald-600" />
                                        <KpiCard label="Inactive" value={fmtInt(reportData.staff.inactiveEmployees)} color="text-red-600" />
                                        <KpiCard label="Administrators" value={fmtInt(reportData.staff.adminCount)} highlight />
                                    </div>
                                    {reportData.staff.roleBreakdown?.length > 0 && (
                                        <div>
                                            <div className="text-[9px] font-black text-secondary uppercase tracking-widest mb-3">By Role</div>
                                            <BreakdownTable
                                                rows={reportData.staff.roleBreakdown.map((r: any) => ({ role: r.role, count: r.count }))}
                                                col1="Role" col2="Headcount"
                                            />
                                        </div>
                                    )}
                                </section>
                            )}

                        </div>

                        {/* Footer */}
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
                                        onError={(e) => { (e.target as HTMLImageElement).src = "/images/logo.jpeg"; }}
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
