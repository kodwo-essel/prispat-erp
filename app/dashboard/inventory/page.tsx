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
        const exportData = displayInventory.map((item: any) => ({
            SKU: item.sku,
            Name: item.name,
            Category: item.category,
            "Total Stock": item.stock,
            Unit: item.unit,
            Hazard: item.hazardClass || "None",
            Status: item.stock === 0 ? 'OUT' : item.stock < 25 ? 'LOW' : 'IN',
            Batches: item.baseItems?.length || 1,
            "Base SKU": item.sku,
            "Market Price": item.unitPrice || 0
        }));
        exportToCSV(exportData, `Unified_Inventory_Manifest_${new Date().toISOString().split('T')[0]}.csv`);
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

    // 1. Initial search filtering (Name, SKU, Chemical)
    const searchFiltered = inventory.filter(item => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.chemical && item.chemical.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    // 2. Grouping Logic for "One Product, Multiple Batches"
    // We group by 'name' first to get the unified commercial identity
    const groupedInventory = searchFiltered.reduce((acc: any, item: any) => {
        const productKey = item.name;
        if (!acc[productKey]) {
            acc[productKey] = {
                ...item,
                stock: 0,
                baseItems: []
            };
        }
        acc[productKey].stock += (Number(item.stock) || 0);
        acc[productKey].baseItems.push(item);
        return acc;
    }, {});

    // 3. Final categorical and status filtering applied to the UNIFIED products
    const displayInventory = Object.values(groupedInventory).filter((product: any) => {
        const matchesCategory = categoryFilter === "All Categories" || product.category === categoryFilter;
        
        const currentStatus = product.stock === 0 ? "OUT" :
            product.stock < 25 ? "LOW" :
                "IN";
        const matchesStatus = statusFilter === "All" || currentStatus === statusFilter;

        return matchesCategory && matchesStatus;
    });

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categoryFilter, statusFilter]);

    const totalPages = Math.ceil(displayInventory.length / pageSize);
    const paginatedInventory = displayInventory.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const getSoldQuantityForProduct = (productName: string) => {
        return orders.reduce((total, order) => {
            const items = order.items.filter((i: any) => i.name === productName);
            return total + items.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0);
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
            <div className="bg-white border border-border p-4 rounded-sm flex items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4 flex-grow">
                    <div className="relative flex-grow max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                        <input
                            type="text"
                            placeholder="Search by SKU, Name or Chemical..."
                            className="bg-muted border border-border pl-10 pr-4 py-2 rounded-sm text-xs w-full focus:outline-none focus:border-primary border-slate-300"
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
                <div className="text-xs text-secondary font-medium">Showing {displayInventory.length} products tracking multiple batches</div>
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
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-left">Product SKU</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-left">Product / Brand Name</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-left text-center">Batches</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-left">Total Stock</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-left">Total Sold</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-left">Selling Price</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-left">Status</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paginatedInventory.map((item: any, index) => (
                                <tr key={item.name} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-slate-400 tabular-nums">{(currentPage - 1) * pageSize + index + 1}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[10px] font-bold text-secondary tabular-nums tracking-tight">{item.sku}</div>
                                        <div className="text-[8px] font-bold text-primary mt-0.5 uppercase">Master Product Code</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-black text-slate-900">{item.name}</div>
                                        <div className="text-[9px] text-secondary mt-0.5 uppercase tracking-tighter">{item.category} • {item.hazardClass || 'Safe'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-[10px] font-bold border border-blue-100">
                                            {item.baseItems.length}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`text-[11px] font-black tabular-nums ${item.stock < 10 ? 'text-red-600' :
                                            item.stock < 25 ? 'text-orange-600' :
                                                'text-green-600'
                                            }`}>
                                            {item.stock}
                                        </div>
                                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{item.unit}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[11px] font-bold text-orange-600 tabular-nums">
                                            {getSoldQuantityForProduct(item.name)}
                                        </div>
                                        <div className="text-[8px] text-secondary uppercase font-bold tracking-widest">Aggregate Velocity</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[11px] font-bold text-primary tabular-nums">₵{item.unitPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
                                        <div className="text-[8px] text-slate-400 font-medium uppercase tracking-tighter">Current Base Price</div>
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
                                            Manage Product <ArrowRight size={10} />
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
                    totalRecords={displayInventory.length}
                    pageSize={pageSize}
                />
            </div>
        </div>
    );
}
