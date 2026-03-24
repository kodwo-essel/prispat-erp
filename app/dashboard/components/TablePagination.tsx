"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalRecords: number;
    pageSize: number;
}

const TablePagination: React.FC<TablePaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalRecords,
    pageSize
}) => {
    if (totalPages <= 1) {
        return (
            <div className="px-6 py-3 bg-muted border-t border-border flex items-center justify-between mt-auto">
                <div className="text-[10px] text-secondary">
                    Displaying all {totalRecords} records in current view.
                </div>
            </div>
        );
    }

    const startIdx = (currentPage - 1) * pageSize + 1;
    const endIdx = Math.min(currentPage * pageSize, totalRecords);

    return (
        <div className="px-6 py-3 bg-muted border-t border-border flex items-center justify-between mt-auto">
            <div className="text-[10px] text-secondary font-medium">
                Showing <span className="text-primary font-bold">{startIdx}-{endIdx}</span> of <span className="text-primary font-bold">{totalRecords}</span> entries
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${currentPage === 1 ? "text-slate-300 cursor-not-allowed" : "text-primary hover:text-primary/70"
                        }`}
                >
                    <ChevronLeft size={12} /> Previous
                </button>

                <div className="flex items-center gap-1.5">
                    {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        // Basic logic to show only few pages if there are many
                        if (
                            totalPages > 7 &&
                            pageNum !== 1 &&
                            pageNum !== totalPages &&
                            Math.abs(pageNum - currentPage) > 1
                        ) {
                            if (Math.abs(pageNum - currentPage) === 2) {
                                return <span key={pageNum} className="text-[10px] text-slate-400">...</span>;
                            }
                            return null;
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`h-6 w-6 flex items-center justify-center text-[10px] font-bold rounded-sm transition-all ${currentPage === pageNum
                                        ? "bg-primary text-white shadow-sm"
                                        : "bg-white border border-border text-secondary hover:border-primary hover:text-primary"
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${currentPage === totalPages ? "text-slate-300 cursor-not-allowed" : "text-primary hover:text-primary/70"
                        }`}
                >
                    Next <ChevronRight size={12} />
                </button>
            </div>
        </div>
    );
};

export default TablePagination;
