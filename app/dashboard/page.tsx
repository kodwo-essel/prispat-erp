"use client";

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

export default function DashboardPage() {
    const [stats, setStats] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
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
        <div className="flex flex-col gap-8">
            {/* Welcome Title */}
            <div>
                <h1 className="text-2xl font-bold">Operational Overview</h1>
                <p className="text-sm text-secondary mt-1">Real-time surveillance of national distribution and warehouse metrics.</p>
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
                                <div key={i} className={`bg-white border-l-4 ${getAlertColor(alert.severity)} border-y border-r border-border p-4 flex items-center justify-between`}>
                                    <div className="flex items-start gap-3">
                                        {alert.type === 'EXPIRY' ? <AlertTriangle size={18} className="mt-0.5 shrink-0" /> : <Package size={18} className="mt-0.5 shrink-0" />}
                                        <div>
                                            <div className="text-xs font-bold text-primary">{alert.title}</div>
                                            <div className="text-[11px] text-secondary mt-1">{alert.description}</div>
                                        </div>
                                    </div>
                                    <button className="text-[10px] font-bold text-primary border border-primary px-3 py-1 rounded-sm hover:bg-primary/5">ACTION</button>
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
                                <div key={i} className="flex gap-4">
                                    <div className="text-[10px] text-secondary tabular-nums w-12 pt-1">{activity.time}</div>
                                    <div className="flex flex-col flex-grow">
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs font-bold text-primary">{activity.action}</div>
                                            {activity.type === 'Revenue' ? <CheckCircle2 size={12} className="text-green-600" /> : <DollarSign size={12} className="text-slate-600" />}
                                        </div>
                                        <div className="text-[10px] text-secondary">Initiated by {activity.user} • {activity.status}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-[10px] text-secondary">No recent activities recorded.</div>
                        )}
                    </div>

                    <button className="mt-4 text-[10px] font-bold text-secondary text-center uppercase tracking-widest hover:text-primary transition-colors">
                        View Complete Audit Trail
                    </button>
                </div>
            </div>
        </div>
    );
}
