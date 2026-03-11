import Link from "next/link";
import {
    Plus,
    FileText,
    Users,
    Star,
    CreditCard,
    TrendingDown,
    UserPlus,
    ArrowRight
} from "lucide-react";

export default function CustomersPage() {
    const customers = [
        { id: "CUST-801", name: "Green Valley Cooperatives", type: "Retailer", location: "Sunyani Region", balance: "$4,250.00", status: "Active", credit: "Premium" },
        { id: "CUST-802", name: "Kofi Mensah Farms", type: "Individual Farmer", location: "Kumasi North", balance: "$120.00", status: "Active", credit: "Standard" },
        { id: "CUST-803", name: "Northern Soils Distribution", type: "Wholesaler", location: "Tamale District", balance: "$12,800.00", status: "Overdue", credit: "Restricted" },
        { id: "CUST-804", name: "Modern Agro Retail", type: "Retailer", location: "Accra East", balance: "$0.00", status: "Active", credit: "Premium" },
        { id: "CUST-805", name: "Smallholder Unity Group", type: "Cooperative", location: "Hohoe District", balance: "$1,150.00", status: "Under Review", credit: "Basic" },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Sales & CRM Registry</h1>
                    <p className="text-sm text-secondary mt-1">Unified database of authorized retailers, cooperatives, and individual smallholder farmers.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/customers/debtors" className="flex items-center gap-2 text-xs font-bold text-primary border border-primary px-4 py-2 rounded-sm hover:bg-primary/5 uppercase tracking-wider transition-colors">
                        <FileText size={14} /> Generate Debtor Report
                    </Link>
                    <Link href="/dashboard/customers/new" className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider">
                        <UserPlus size={14} /> Register New Client
                    </Link>
                </div>
            </div>

            {/* Customer Segment Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-border p-4 rounded-sm flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Total Clients</div>
                        <div className="text-2xl font-bold text-primary mt-1">1,422</div>
                    </div>
                    <Users size={20} className="text-primary opacity-50" />
                </div>
                <div className="bg-white border border-border p-4 rounded-sm flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Premium Retailers</div>
                        <div className="text-2xl font-bold text-primary mt-1">42</div>
                    </div>
                    <Star size={20} className="text-primary opacity-50" />
                </div>
                <div className="bg-white border border-border p-4 rounded-sm flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Active Credit Lines</div>
                        <div className="text-2xl font-bold text-primary mt-1">215</div>
                    </div>
                    <CreditCard size={20} className="text-primary opacity-50" />
                </div>
                <div className="bg-white border border-border p-4 rounded-sm flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Accounts Receivable</div>
                        <div className="text-2xl font-bold text-red-600 mt-1">$48.2k</div>
                    </div>
                    <TrendingDown size={20} className="text-red-600 opacity-50" />
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted border-b border-border">
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Client ID</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Organization / Name</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Tier / Location</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Outstanding Bal.</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Credit Rating</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Verification</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {customers.map((cust) => (
                            <tr key={cust.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-xs font-bold text-primary tabular-nums">{cust.id}</td>
                                <td className="px-6 py-4">
                                    <div className="text-xs font-semibold text-primary">{cust.name}</div>
                                    <div className="text-[10px] text-secondary mt-0.5">{cust.type}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs text-secondary">{cust.location}</div>
                                    <div className="text-[9px] font-bold text-slate-400 mt-0.5">District Verified</div>
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-primary tabular-nums">{cust.balance}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight ${cust.credit === 'Premium' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                        cust.credit === 'Standard' ? 'bg-green-50 text-green-600 border border-green-100' :
                                            cust.credit === 'Restricted' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                'bg-slate-50 text-slate-500 border border-slate-100'
                                        }`}>
                                        {cust.credit}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={`/dashboard/customers/${cust.id}`} className="inline-flex items-center justify-end gap-1 text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                                        Open Profile <ArrowRight size={10} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
