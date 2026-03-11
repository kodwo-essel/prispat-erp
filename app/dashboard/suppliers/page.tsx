import {
    Plus,
    ShieldCheck,
    Truck,
    Clock,
    Award,
    ExternalLink,
    ClipboardCheck
} from "lucide-react";

export default function SuppliersPage() {
    const suppliers = [
        { id: "SUP-001", name: "AgroGen Hub", contact: "John Smith", phone: "+233 24 123 4567", category: "General Chemicals", reliability: "98%", status: "Approved" },
        { id: "SUP-002", name: "BioDirect Solutions", contact: "Maria Garcia", phone: "+233 20 987 6543", category: "Organic Fertilizers", reliability: "92%", status: "On Probation" },
        { id: "SUP-003", name: "TerraChem Ltd", contact: "David Chen", phone: "+233 55 555 1234", category: "Herbicides", reliability: "99%", status: "Approved" },
        { id: "SUP-004", name: "GreenLeaf Agro", contact: "Sarah Mensah", phone: "+233 27 777 8888", category: "Plant Nutrients", reliability: "85%", status: "Under Review" },
        { id: "SUP-005", name: "Global Pest Control", contact: "Robert Wilson", phone: "+233 24 000 1111", category: "Insecticides", reliability: "95%", status: "Approved" },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Supplier & Procurement Directory</h1>
                    <p className="text-sm text-secondary mt-1">Registry of authorized agrochemical manufacturers and regional wholesalers.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 text-xs font-bold text-primary border border-primary px-4 py-2 rounded-sm hover:bg-primary/5 uppercase tracking-wider transition-colors">
                        <ClipboardCheck size={14} /> Audit Supplier Performance
                    </button>
                    <button className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider">
                        <Plus size={14} /> Onboard New Supplier
                    </button>
                </div>
            </div>

            {/* Stats Overview for Suppliers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-border p-4 rounded-sm flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Active Suppliers</div>
                        <div className="text-2xl font-bold text-primary mt-1">86</div>
                        <div className="text-[10px] text-green-600 font-bold mt-1">+4 this month</div>
                    </div>
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center text-primary">
                        <Truck size={20} />
                    </div>
                </div>
                <div className="bg-white border border-border p-4 rounded-sm flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Avg. Delivery Lead Time</div>
                        <div className="text-2xl font-bold text-primary mt-1">3.2 Days</div>
                        <div className="text-[10px] text-secondary font-medium mt-1">Target: &lt; 4.0 Days</div>
                    </div>
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center text-primary">
                        <Clock size={20} />
                    </div>
                </div>
                <div className="bg-white border border-border p-4 rounded-sm flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Quality Pass Rate</div>
                        <div className="text-2xl font-bold text-primary mt-1">99.4%</div>
                        <div className="text-[10px] text-green-600 font-bold mt-1">Exceeding Standards</div>
                    </div>
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center text-primary">
                        <Award size={20} />
                    </div>
                </div>
            </div>

            {/* Suppliers Table */}
            <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted border-b border-border">
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Registry ID</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Manufacturer / Hub</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Category Focus</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Reliability Rating</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Status</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Records</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {suppliers.map((sup) => (
                            <tr key={sup.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-xs font-bold text-primary tabular-nums">{sup.id}</td>
                                <td className="px-6 py-4">
                                    <div className="text-xs font-semibold text-primary">{sup.name}</div>
                                    <div className="text-[10px] text-secondary mt-0.5">{sup.contact} • {sup.phone}</div>
                                </td>
                                <td className="px-6 py-4 text-xs text-secondary">{sup.category}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-grow bg-slate-100 h-1.5 rounded-full overflow-hidden w-24">
                                            <div className="bg-primary h-full" style={{ width: sup.reliability }}></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-primary tabular-nums">{sup.reliability}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight ${sup.status === 'Approved' ? 'bg-green-50 text-green-600 border border-green-100' :
                                            sup.status === 'On Probation' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                                'bg-slate-50 text-slate-500 border border-slate-100'
                                        }`}>
                                        {sup.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="flex items-center justify-end gap-1 text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                                        Procure <ExternalLink size={10} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
