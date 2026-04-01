"use client";

import { useState, useMemo } from "react";
import {
    Search,
    X,
    Package,
    Check,
    ChevronRight,
    Loader2,
    Filter
} from "lucide-react";
import TablePagination from "./TablePagination";

interface InventoryItem {
    _id: string;
    sku: string;
    name: string;
    category: string;
    unit: string;
    stock: number;
    unitPrice: number;
    supplierPrice: number;
    hazardClass?: string;
}

interface AssetSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: InventoryItem) => void;
    inventory: InventoryItem[];
    title?: string;
    showStock?: boolean;
}

export default function AssetSelectorModal({
    isOpen,
    onClose,
    onSelect,
    inventory,
    title = "Select Agrochemical Product",
    showStock = true
}: AssetSelectorModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    const categories = useMemo(() => {
        const cats = new Set(inventory.map(i => i.category));
        return ["All Categories", ...Array.from(cats)].sort();
    }, [inventory]);

    // Group inventory by name for a "One Product" selection experience
    const groupedInventory = useMemo(() => {
        const groups: Record<string, InventoryItem & { allBatches: InventoryItem[] }> = {};
        
        inventory.forEach(item => {
            if (!groups[item.name]) {
                groups[item.name] = {
                    ...item,
                    stock: 0,
                    allBatches: []
                };
            }
            groups[item.name].stock += (item.stock || 0);
            groups[item.name].allBatches.push(item);
        });
        
        return Object.values(groups);
    }, [inventory]);

    const filteredItems = useMemo(() => {
        return groupedInventory.filter(item => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.sku.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = categoryFilter === "All Categories" || item.category === categoryFilter;

            return matchesSearch && matchesCategory;
        });
    }, [groupedInventory, searchQuery, categoryFilter]);

    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredItems.slice(start, start + pageSize);
    }, [filteredItems, currentPage]);

    const totalPages = Math.ceil(filteredItems.length / pageSize);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-border animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-primary/10 text-primary flex items-center justify-center rounded-sm">
                            <Package size={18} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-primary">{title}</h2>
                            <p className="text-[10px] text-secondary font-bold uppercase tracking-tighter">Authorized Registry Access</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-sm text-secondary transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 bg-slate-50 border-b border-border flex flex-col md:flex-row gap-3">
                    <div className="relative flex-grow">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                        <input
                            type="text"
                            placeholder="Search by SKU or Product Name..."
                            className="w-full bg-white border border-border pl-10 pr-4 py-2 rounded-sm text-xs focus:outline-none focus:border-primary font-medium"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            autoFocus
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-secondary" />
                        <select
                            className="bg-white border border-border px-3 py-2 rounded-sm text-xs focus:outline-none focus:border-primary font-bold min-w-[140px]"
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* List */}
                <div className="flex-grow overflow-y-auto bg-white">
                    {paginatedItems.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-300 gap-4">
                            <Package size={48} className="opacity-20" />
                            <div className="text-center">
                                <p className="text-xs font-bold uppercase tracking-widest">No matching products found</p>
                                <p className="text-[10px] uppercase font-medium mt-1">Try adjusting your search criteria</p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {paginatedItems.map(item => (
                                <div
                                    key={item._id}
                                    onClick={() => onSelect(item)}
                                    className="px-6 py-4 hover:bg-slate-50 cursor-pointer flex items-center justify-between group transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 flex flex-col items-center justify-center border border-border rounded-sm bg-white group-hover:border-primary transition-colors">
                                            <span className="text-[10px] font-black text-primary uppercase leading-none">{item.sku.substring(0, 3)}</span>
                                            <span className="text-[8px] font-bold text-secondary">{item.sku.substring(3, 6)}</span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                {item.name}
                                                <span className="text-[9px] bg-slate-100 text-secondary px-1.5 py-0.5 rounded-sm font-black uppercase tracking-tighter border border-slate-200">{item.sku}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-bold text-secondary uppercase tracking-tight">{item.category}</span>
                                                <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                                                <span className="text-[10px] font-medium text-slate-400">Unit: {item.unit}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-6">
                                        {showStock && (
                                            <div>
                                                <div className={`text-xs font-black tabular-nums ${item.stock > 0 ? 'text-primary' : 'text-red-600'}`}>
                                                    {item.stock} {item.unit}
                                                </div>
                                                <div className="text-[9px] font-bold text-secondary uppercase tracking-tighter">Current Stock</div>
                                            </div>
                                        )}
                                        <div className="h-8 w-8 rounded-sm bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1 shadow-sm border border-primary/10">
                                            <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Pagination */}
                <div className="px-6 py-3 bg-slate-50 border-t border-border flex items-center justify-between">
                    <div className="text-[9px] font-bold text-secondary uppercase tracking-widest">
                        Showing {Math.min(filteredItems.length, (currentPage - 1) * pageSize + 1)}-{Math.min(filteredItems.length, currentPage * pageSize)} of {filteredItems.length} Products
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1 border border-border rounded-sm bg-white disabled:opacity-30 hover:border-primary transition-colors"
                            >
                                <X size={14} className="rotate-90" /> {/* Reuse X or similar for simple prev/next if needed, or stick to TablePagination style */}
                            </button>
                            <span className="text-[10px] font-black tabular-nums">{currentPage} / {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1 border border-border rounded-sm bg-white disabled:opacity-30 hover:border-primary transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
