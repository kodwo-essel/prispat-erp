"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    FileText,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Loader2,
    History,
    Filter
} from "lucide-react";
import { exportToCSV } from "@/lib/exportUtils";
import TablePagination from "@/app/dashboard/components/TablePagination";

export default function InventoryPage() {
    const [inventory, setInventory] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [statusFilter, setStatusFilter] = useState("All");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const handleExport = () => {
        const exportData = filteredInventory.map(item => ({
            SKU: item.sku,
            Name: item.name,
            Category: item.category,
            Stock: item.stock,
            Unit: item.unit,
            Hazard: item.hazardClass || "None",
            Status: item.status,
            BatchID: item.batchId,
            ExpiryDate: item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A",
            Supplier: item.supplier,
            "Supplier Price": item.supplierPrice || 0,
            "Selling Price": item.unitPrice || 0
        }));
        exportToCSV(exportData, `Inventory_Manifest_${new Date().toISOString().split('T')[0]}.csv`);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [invRes, ordRes] = await Promise.all([
                    fetch("/api/inventory"),
                    fetch("/api/orders")
                ]);
                const invJson = await invRes.json();
                const ordJson = await ordRes.json();
                if (invJson.success) setInventory(invJson.data);
                if (ordJson.success) setOrders(ordJson.data);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredInventory = inventory.filter(item => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.chemical && item.chemical.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = categoryFilter === "All Categories" || item.category === categoryFilter;
        const currentStatus = item.stock === 0 ? "OUT" :
            item.stock < 25 ? "LOW" :
                "IN";

        const matchesStatus = statusFilter === "All" || currentStatus === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categoryFilter, statusFilter]);

    const totalPages = Math.ceil(filteredInventory.length / pageSize);
    const paginatedInventory = filteredInventory.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const getSoldQuantity = (sku: string, batchId: string) => {
        return orders.reduce((total, order) => {
            const item = order.items.find((i: any) => i.sku === sku && i.batchId === batchId);
            return total + (item ? item.quantity : 0);
        }, 0);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Central Inventory Registry</h1>
                    <p className="text-sm text-secondary mt-1">Authorized stock ledger for all nationwide distribution centers.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/suppliers/supplies" className="flex items-center gap-2 text-xs font-bold text-secondary border border-border px-4 py-2 rounded-sm hover:bg-muted uppercase tracking-wider transition-colors">
                        <History size={14} /> Inbound History
                    </Link>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 text-xs font-bold text-primary border border-primary px-4 py-2 rounded-sm hover:bg-primary/5 uppercase tracking-wider transition-colors"
                    >
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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-white border border-border px-4 py-2 rounded-sm text-xs focus:outline-none focus:border-primary"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option>All Categories</option>
                        <option>Herbicide</option>
                        <option>Fertilizer</option>
                        <option>Insecticide</option>
                        <option>Fungicide</option>
                        <option>Equipment</option>
                        <option>General</option>
                    </select>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest hidden lg:block">Status:</span>
                        <div className="flex bg-muted p-1 rounded-sm border border-border">
                            {["All", "IN", "LOW", "OUT"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] rounded-sm transition-all whitespace-nowrap ${statusFilter === status ? "bg-white text-primary shadow-sm border border-border" : "text-secondary hover:text-primary"}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="text-xs text-secondary font-medium">Showing {filteredInventory.length} records</div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white border border-border rounded-sm shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                {loading ? (
                    <div className="flex-grow flex flex-col items-center justify-center gap-4 text-slate-400">
                        <Loader2 size={32} className="animate-spin text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest">Accessing Secure Records...</span>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted border-b border-border">
                                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-center">#</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-left">SKU / Batch</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-left">Product Name</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-left">Supplier</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-left">Stock</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-left">Sold</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-left">Supplier Price</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-left">Selling Price</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-left">Expiry</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-left">Status</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paginatedInventory.map((item, index) => (
                                <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-slate-400 tabular-nums">{(currentPage - 1) * pageSize + index + 1}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[10px] font-semibold text-secondary tabular-nums tracking-tight">{item.sku}</div>
                                        <div className="text-[8px] font-mono text-slate-400 mt-0.5 uppercase">{item.batchId}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-semibold text-primary">{item.name}</div>
                                        <div className="text-[9px] text-secondary mt-0.5 uppercase tracking-tighter">{item.category} • {item.hazardClass || 'Safe'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[10px] font-medium text-secondary uppercase tracking-tight">
                                            {item.supplier}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`text-[11px] font-bold tabular-nums ${item.stock < 10 ? 'text-red-600' :
                                            item.stock < 25 ? 'text-orange-600' :
                                                'text-green-600'
                                            }`}>
                                            {item.stock}
                                        </div>
                                        <div className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">{item.unit}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[11px] font-bold text-orange-600 tabular-nums">
                                            {getSoldQuantity(item.sku, item.batchId)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[11px] font-bold text-blue-600 tabular-nums">
                                            {item.supplierPrice && item.supplierPrice > 0
                                                ? `₵${item.supplierPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[11px] font-bold text-primary tabular-nums">₵{item.unitPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
                                        <div className="text-[8px] text-slate-400 font-medium uppercase tracking-tighter">per {item.unit.replace(/s$/, '')}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-medium text-secondary tabular-nums">
                                            {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                                        </div>
                                        {item.expiryDate && new Date(item.expiryDate) < new Date() && (
                                            <div className="text-[8px] font-bold text-red-500 uppercase">Expired</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest ${item.stock === 0 ? 'bg-red-50 text-red-700 border-red-200' :
                                                item.stock < 25 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-green-50 text-green-700 border-green-200'
                                                }`}>
                                                {item.stock === 0 ? 'OUT' :
                                                    item.stock < 25 ? 'LOW' :
                                                        'IN'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/dashboard/inventory/${item._id}`} className="inline-flex items-center justify-end gap-1 text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                                            Manage <ArrowRight size={10} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalRecords={filteredInventory.length}
                    pageSize={pageSize}
                />
            </div>
        </div>
    );
}
