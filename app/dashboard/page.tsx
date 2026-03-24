"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    Package,
    Truck,
    Users,
    DollarSign,
    Activity,
    Fingerprint,
    Loader2
} from "lucide-react";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

const COLORS = [
    '#002d62', // Dark Blue rgb(0, 45, 98)
    '#204573',
    '#405d84',
    '#607595',
    '#808da6',
    '#9ca3af'  // Gray
];

export default function DashboardPage() {
    // ...
    const [stats, setStats] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
    const [mtdRevenue, setMtdRevenue] = useState<number>(0);
    const [inventorySummary, setInventorySummary] = useState<any>(null);
    const [inventoryByCategory, setInventoryByCategory] = useState<any[]>([]);
    const [financialDistribution, setFinancialDistribution] = useState<any[]>([]);
    const [supplierDistribution, setSupplierDistribution] = useState<any[]>([]);
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/dashboard/stats");
                const json = await res.json();
                if (json.success) {
                    setStats(json.data.stats);
                    setActivities(json.data.activities);
                    setAlerts(json.data.alerts || []);
                    setRevenueTrend(json.data.revenueTrend || []);
                    setMtdRevenue(json.data.mtdRevenue || 0);
                    setInventorySummary(json.data.inventorySummary);
                    setInventoryByCategory(json.data.inventoryByCategory || []);
                    setFinancialDistribution(json.data.financialDistribution || []);
                    setSupplierDistribution(json.data.supplierDistribution || []);
                    setConfig(json.data.config);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const getIcon = (label: string) => {
        switch (label) {
            case "Active Inventory Items": return <Package size={16} />;
            case "Pending Shipments": return <Truck size={16} />;
            case "Active Suppliers": return <Users size={16} />;
            case "Total Asset Value": return <DollarSign size={16} />;
            default: return <Activity size={16} />;
        }
    };

    const getAlertColor = (severity: string) => {
        switch (severity) {
            case "high": return "border-red-600 text-red-600";
            case "medium": return "border-orange-500 text-orange-500";
            case "low": return "border-blue-500 text-blue-500";
            default: return "border-slate-400 text-slate-400";
        }
    };

    if (loading) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-400">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Aggregating Global Metrics...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-12">
            {/* Welcome Title */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold">{config?.organizationName || "Operational Overview"}</h1>
                    <p className="text-sm text-secondary mt-1">Real-time surveillance of national distribution and warehouse metrics.</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] bg-muted px-3 py-1 rounded-sm border border-border">
                        Node Status: {config?.systemNodeId || "GH-ACCRA-CORE-01"}
                    </div>
                    {config?.organizationName && (
                        <div className="text-[8px] font-black text-primary uppercase tracking-widest opacity-40">
                            Central Command Hub
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white border border-border p-6 rounded-sm shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-secondary">{stat.label}</div>
                            <div className="text-secondary opacity-50">{getIcon(stat.label)}</div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-3xl font-bold text-primary">{stat.value}</div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-green-600' :
                                stat.trend === 'down' ? 'text-red-600' : 'text-slate-400'
                                }`}>
                                {stat.trend === 'up' && <TrendingUp size={12} />}
                                {stat.trend === 'down' && <TrendingDown size={12} />}
                                {stat.change}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white border border-border rounded-sm p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Settlement Performance</h3>
                            <p className="text-[10px] text-secondary font-bold uppercase mt-1">Net Revenue Flow (Last 7 Days)</p>
                        </div>
                        <Activity size={16} className="text-primary opacity-20" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueTrend}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#002d62" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#002d62" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                    tickFormatter={(value) => `₵${Number(value).toLocaleString()}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#002d62',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        textTransform: 'uppercase'
                                    }}
                                    itemStyle={{ color: '#9ca3af' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#002d62"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white border border-border rounded-sm p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Package size={120} />
                    </div>
                    <div className="z-10 text-center">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-2">Inventory Health</div>
                        <div className="text-5xl font-black text-[#002d62] mb-2">{inventorySummary?.health || 0}%</div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
                            <span className="h-1.5 w-1.5 bg-[#002d62] rounded-full animate-pulse" /> Optimal Coverage
                        </div>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-4 w-full border-t border-border pt-6">
                        <div className="text-center">
                            <div className="text-[10px] font-black text-[#002d62]">₵{mtdRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
                            <div className="text-[8px] font-bold text-secondary uppercase tracking-tight">MTD Revenue</div>
                        </div>
                        <div className="text-center border-l border-border">
                            <div className="text-[10px] font-black text-[#002d62]">{inventorySummary?.lowStock || 0}</div>
                            <div className="text-[8px] font-bold text-secondary uppercase tracking-tight">Low Stock</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Inventory by Category */}
                <div className="md:col-span-2 bg-white border border-border rounded-sm p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-secondary">Inventory by Category</h3>
                        <Package size={14} className="text-primary opacity-40" />
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={inventoryByCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {inventoryByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#002d62', border: 'none', borderRadius: '4px', fontSize: '10px', color: '#fff' }}
                                />
                                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Financial Distribution */}
                <div className="bg-white border border-border rounded-sm p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-secondary">30D Cash Flow</h3>
                        <Activity size={14} className="text-primary opacity-40" />
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={financialDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={0}
                                    outerRadius={80}
                                    paddingAngle={0}
                                    dataKey="value"
                                >
                                    {financialDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === 'Revenue' ? '#002d62' : '#9ca3af'} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any) => value ? `₵${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "₵0.00"}
                                    contentStyle={{ backgroundColor: '#002d62', border: 'none', borderRadius: '4px', fontSize: '10px', color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                        {financialDistribution.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-[10px] font-bold uppercase">
                                <span className={item.name === 'Revenue' ? 'text-[#002d62]' : 'text-slate-400'}>{item.name}</span>
                                <span className="text-[#002d62]">₵{item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Critical Alerts */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                        <h3 className="text-sm font-bold uppercase tracking-widest">Critical System Alerts</h3>
                        {alerts.length > 0 && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase">Action Required</span>}
                    </div>

                    <div className="flex flex-col gap-3">
                        {alerts.length > 0 ? (
                            alerts.map((alert, i) => (
                                <div key={i} className={`bg-white border-l-4 ${getAlertColor(alert.severity)} border-y border-r border-border p-4 flex items-center justify-between group hover:shadow-md transition-shadow`}>
                                    <div className="flex items-start gap-3">
                                        {alert.type === 'EXPIRY' ? <AlertTriangle size={18} className="mt-0.5 shrink-0" /> : <Package size={18} className="mt-0.5 shrink-0" />}
                                        <div>
                                            <div className="text-xs font-bold text-primary group-hover:text-primary/80 transition-colors uppercase tracking-tight">{alert.title}</div>
                                            <div className="text-[11px] text-secondary mt-1">{alert.description}</div>
                                        </div>
                                    </div>
                                    <Link href={alert.link || "/dashboard/inventory"} className="text-[10px] font-black text-primary border-2 border-primary/20 px-4 py-1.5 rounded-sm hover:bg-primary hover:text-white hover:border-primary transition-all uppercase tracking-widest">
                                        RECONCILE
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white border border-border p-8 rounded-sm text-center">
                                <CheckCircle2 size={32} className="text-green-600 mx-auto mb-2 opacity-20" />
                                <p className="text-xs font-bold text-secondary uppercase tracking-widest">System Status: Nominal</p>
                                <p className="text-[10px] text-slate-400 mt-1">No critical alerts detected in the current audit cycle.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                        <h3 className="text-sm font-bold uppercase tracking-widest">Live Activity Log</h3>
                    </div>

                    <div className="flex flex-col gap-4">
                        {activities.length > 0 ? (
                            activities.map((activity, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="text-[10px] font-bold text-secondary tabular-nums w-12 pt-1 opacity-60 group-hover:opacity-100 transition-opacity">{activity.time}</div>
                                    <div className="flex flex-col flex-grow bg-white border border-transparent group-hover:border-border group-hover:p-1.5 group-hover:rounded-sm transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs font-bold text-primary truncate max-w-[150px] uppercase tracking-tighter">{activity.action}</div>
                                            {activity.type === 'Revenue' ? <CheckCircle2 size={12} className="text-green-600" /> : <DollarSign size={12} className="text-slate-600" />}
                                        </div>
                                        <div className="text-[9px] text-secondary font-medium uppercase tracking-widest mt-0.5">By {activity.user} • {activity.status}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-[10px] text-secondary">No recent activities recorded.</div>
                        )}
                    </div>

                    <button className="mt-4 text-[10px] font-black text-secondary text-center uppercase tracking-[0.2em] hover:text-primary transition-colors py-2 border border-dashed border-border rounded-sm hover:border-primary">
                        View Complete Audit Trail
                    </button>
                </div>
            </div>
        </div>
    );
}
