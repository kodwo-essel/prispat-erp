import Link from "next/link";
import {
    Plus,
    Search,
    FileText,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Package
} from "lucide-react";

export default function InventoryPage() {
    const inventory = [
        { id: "SKU-001", name: "Glyphosate 480SL", category: "Herbicide", stock: 1420, unit: "Liters", status: "In Stock", hazard: "Level 2" },
        { id: "SKU-002", name: "Paraquat-Dichloride", category: "Herbicide", stock: 12, unit: "Cases", status: "Critical", hazard: "Level 4" },
        { id: "SKU-003", name: "NPK 15-15-15", category: "Fertilizer", stock: 850, unit: "Bags", status: "In Stock", hazard: "None" },
        { id: "SKU-004", name: "Abamectin 1.8EC", category: "Insecticide", stock: 45, unit: "Bottles", status: "Low Stock", hazard: "Level 3" },
        { id: "SKU-005", name: "Mancozeb 80WP", category: "Fungicide", stock: 210, unit: "Kg", status: "In Stock", hazard: "Level 1" },
        { id: "SKU-006", name: "Urea 46% N", category: "Fertilizer", stock: 1100, unit: "Bags", status: "In Stock", hazard: "None" },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Central Inventory Registry</h1>
                    <p className="text-sm text-secondary mt-1">Authorized stock ledger for all nationwide distribution centers.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 text-xs font-bold text-primary border border-primary px-4 py-2 rounded-sm hover:bg-primary/5 uppercase tracking-wider transition-colors">
                        <FileText size={14} /> Export Manifest (CSV)
                    </button>
                    <Link href="/dashboard/inventory/new" className="btn-primary flex items-center gap-2 text-xs uppercase tracking-wider">
                        <Plus size={14} /> Record New Arrival
                    </Link>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white border border-border p-4 rounded-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-grow">
                    <div className="relative flex-grow max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                        <input
                            type="text"
                            placeholder="Search by SKU, Name or Chemical..."
                            className="bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary"
                        />
                    </div>
                    <select className="bg-white border border-border px-4 py-2 rounded-sm text-xs focus:outline-none focus:border-primary">
                        <option>All Categories</option>
                        <option>Herbicide</option>
                        <option>Fertilizer</option>
                        <option>Insecticide</option>
                        <option>Fungicide</option>
                    </select>
                    <select className="bg-white border border-border px-4 py-2 rounded-sm text-xs focus:outline-none focus:border-primary">
                        <option>All Statuses</option>
                        <option>In Stock</option>
                        <option>Low Stock</option>
                        <option>Critical</option>
                    </select>
                </div>
                <div className="text-xs text-secondary font-medium">Showing {inventory.length} records</div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted border-b border-border">
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">SKU / ID</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Product Name</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Category</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Stock Level</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Hazard</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary">Status</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {inventory.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-xs font-bold text-primary tabular-nums">{item.id}</td>
                                <td className="px-6 py-4">
                                    <div className="text-xs font-semibold text-primary">{item.name}</div>
                                    <div className="text-[10px] text-secondary mt-0.5">Verified Standard Batch</div>
                                </td>
                                <td className="px-6 py-4 text-xs text-secondary">{item.category}</td>
                                <td className="px-6 py-4">
                                    <div className="text-xs font-bold text-primary tabular-nums">{item.stock}</div>
                                    <div className="text-[10px] text-secondary">{item.unit}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight ${item.hazard === 'Level 4' ? 'bg-red-50 text-red-600 border border-red-100' :
                                            item.hazard === 'Level 3' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                                item.hazard === 'Level 2' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                    item.hazard === 'Level 1' ? 'bg-green-50 text-green-600 border border-green-100' :
                                                        'bg-slate-50 text-slate-500 border border-slate-100'
                                        }`}>
                                        {item.hazard || 'None'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`h-1.5 w-1.5 rounded-full ${item.status === 'In Stock' ? 'bg-green-500' :
                                                item.status === 'Low Stock' ? 'bg-orange-500' : 'bg-red-500'
                                            }`}></span>
                                        <span className="text-xs font-medium text-secondary">{item.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={`/dashboard/inventory/${item.id}`} className="inline-flex items-center justify-end gap-1 text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                                        Manage <ArrowRight size={10} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Placeholder */}
                <div className="px-6 py-3 bg-muted border-t border-border flex items-center justify-between">
                    <div className="text-[10px] text-secondary">Authorized access: Records reflect latest sync with Central Hub.</div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-not-allowed">
                            <ChevronLeft size={12} /> Previous
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="h-6 w-6 bg-primary text-white text-[10px] flex items-center justify-center font-bold rounded-sm shadow-sm">1</span>
                            <span className="h-6 w-6 text-primary text-[10px] flex items-center justify-center font-bold rounded-sm hover:bg-white/50 cursor-pointer">2</span>
                        </div>
                        <button className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
                            Next <ChevronRight size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
