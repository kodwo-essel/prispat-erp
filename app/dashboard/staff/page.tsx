import {
    Users,
    Building2,
    Key,
    UserCheck,
    MoreHorizontal,
    Plus
} from "lucide-react";

export default function StaffPage() {
    const staff = [
        { id: "HR-101", name: "Officer James Doe", role: "Primary Administrator", dept: "Executive", access: "Root", status: "Active" },
        { id: "HR-102", name: "Sarah Mensah", role: "Warehouse Supervisor", dept: "Logistics", access: "Limited", status: "Active" },
        { id: "HR-103", name: "Kofi Annan", role: "Procurement Officer", dept: "Supply Chain", access: "Standard", status: "On Leave" },
        { id: "HR-104", name: "Elena Gilbert", role: "Finance Manager", dept: "Accounts", access: "Financial", status: "Active" },
        { id: "HR-105", name: "Samuel Laryea", role: "Sales Representative", dept: "Distribution", access: "Read-Only", status: "Active" },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Staff & Access Control Hub</h1>
                    <p className="text-sm text-secondary mt-1">Registry of authorized personnel, system roles, and departmental permissions.</p>
                </div>
                <div className="flex gap-3">
                    <button className="text-xs font-bold text-primary border border-primary px-4 py-2 rounded-sm hover:bg-primary/5 uppercase tracking-wider transition-colors">
                        Audit Access Logs
                    </button>
                    <button className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider">
                        <Plus size={14} /> Enlist New Personnel
                    </button>
                </div>
            </div>

            {/* HR Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-border p-4 rounded-sm flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Active Personnel</div>
                        <div className="text-2xl font-bold text-primary mt-1">24</div>
                    </div>
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center text-primary">
                        <UserCheck size={20} />
                    </div>
                </div>
                <div className="bg-white border border-border p-4 rounded-sm flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Departments</div>
                        <div className="text-2xl font-bold text-primary mt-1">6</div>
                    </div>
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center text-primary">
                        <Building2 size={20} />
                    </div>
                </div>
                <div className="bg-white border border-border p-4 rounded-sm flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">Pending Access Requests</div>
                        <div className="text-2xl font-bold text-orange-600 mt-1">3</div>
                    </div>
                    <div className="h-10 w-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                        <Key size={20} />
                    </div>
                </div>
            </div>

            {/* Staff Table */}
            <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted border-b border-border">
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Personnel ID</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Full Name / Position</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Department</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Access Level</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Status</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Settings</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {staff.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-xs font-bold text-primary tabular-nums">{p.id}</td>
                                <td className="px-6 py-4">
                                    <div className="text-xs font-semibold text-primary">{p.name}</div>
                                    <div className="text-[10px] text-secondary mt-0.5">{p.role}</div>
                                </td>
                                <td className="px-6 py-4 text-xs text-secondary">{p.dept}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-sm uppercase ${p.access === 'Root' ? 'bg-primary text-white border-primary' :
                                        p.access === 'Financial' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            p.access === 'Standard' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                                                'bg-muted text-secondary border-border'
                                        }`}>
                                        {p.access}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`h-1.5 w-1.5 rounded-full ${p.status === 'Active' ? 'bg-green-500' : 'bg-orange-400'
                                            }`}></span>
                                        <span className="text-xs font-medium text-secondary">{p.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                                        Manage
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
