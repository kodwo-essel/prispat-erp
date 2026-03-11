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
    Fingerprint
} from "lucide-react";

export default function DashboardPage() {
    const stats = [
        { label: "Active Inventory Items", value: "1,248", change: "+12%", trend: "up", icon: <Package size={16} /> },
        { label: "Pending Shipments", value: "42", change: "-5%", trend: "down", icon: <Truck size={16} /> },
        { label: "Active Suppliers", value: "86", change: "Stable", trend: "neutral", icon: <Users size={16} /> },
        { label: "Total Asset Value", value: "$4.2M", change: "+2.4%", trend: "up", icon: <DollarSign size={16} /> },
    ];

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
                            <div className="text-secondary opacity-50">{stat.icon}</div>
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
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase">Action Required</span>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="bg-white border-l-4 border-red-600 border-y border-r border-border p-4 flex items-center justify-between">
                            <div className="flex items-start gap-3">
                                <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
                                <div>
                                    <div className="text-xs font-bold text-primary">EXPIRY WARNING: BATCH #XP-2029</div>
                                    <div className="text-[11px] text-secondary mt-1">12 cases of Paraquat-Dichloride expiring in 72 hours.</div>
                                </div>
                            </div>
                            <button className="text-[10px] font-bold text-primary border border-primary px-3 py-1 rounded-sm hover:bg-primary/5">REROUTE</button>
                        </div>

                        <div className="bg-white border-l-4 border-orange-500 border-y border-r border-border p-4 flex items-center justify-between">
                            <div className="flex items-start gap-3">
                                <Package size={18} className="text-orange-500 mt-0.5 shrink-0" />
                                <div>
                                    <div className="text-xs font-bold text-primary">LOW STOCK: GLYPHOSATE 480SL</div>
                                    <div className="text-[11px] text-secondary mt-1">Warehouse Zone B-12 below safety threshold (14 units remain).</div>
                                </div>
                            </div>
                            <button className="text-[10px] font-bold text-primary border border-primary px-3 py-1 rounded-sm hover:bg-primary/5">REORDER</button>
                        </div>

                        <div className="bg-white border-l-4 border-slate-400 border-y border-r border-border p-4 flex items-center justify-between">
                            <div className="flex items-start gap-3">
                                <Activity size={18} className="text-slate-400 mt-0.5 shrink-0" />
                                <div>
                                    <div className="text-xs font-bold text-primary">PENDING QUALITY INSPECTION</div>
                                    <div className="text-[11px] text-secondary mt-1">Supplier "AgroGen Hub" shipment awaiting officer approval.</div>
                                </div>
                            </div>
                            <button className="text-[10px] font-bold text-primary border border-primary px-3 py-1 rounded-sm hover:bg-primary/5">REVIEW</button>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                        <h3 className="text-sm font-bold uppercase tracking-widest">Live Activity Log</h3>
                    </div>

                    <div className="flex flex-col gap-4">
                        {[
                            { time: "2 min ago", user: "Admin", action: "Dispatched Order #8921", status: "Success", icon: <CheckCircle2 size={12} className="text-green-600" /> },
                            { time: "14 min ago", user: "System", action: "Inventory Synced: Zone A", status: "Auto", icon: <Activity size={12} className="text-blue-600" /> },
                            { time: "1 hour ago", user: "Officer Ray", action: "New Supplier Approved", status: "Manual", icon: <Users size={12} className="text-slate-600" /> },
                            { time: "3 hours ago", user: "Admin", action: "Security Audit Completed", status: "Security", icon: <Fingerprint size={12} className="text-primary" /> },
                            { time: "5 hours ago", user: "System", action: "Backup Cycle Completed", status: "Auto", icon: <Activity size={12} className="text-slate-400" /> },
                        ].map((activity, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="text-[10px] text-secondary tabular-nums w-12 pt-1">{activity.time}</div>
                                <div className="flex flex-col flex-grow">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-bold text-primary">{activity.action}</div>
                                        {activity.icon}
                                    </div>
                                    <div className="text-[10px] text-secondary">Initiated by {activity.user} • {activity.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-4 text-[10px] font-bold text-secondary text-center uppercase tracking-widest hover:text-primary transition-colors">
                        View Complete Audit Trail
                    </button>
                </div>
            </div>
        </div>
    );
}
