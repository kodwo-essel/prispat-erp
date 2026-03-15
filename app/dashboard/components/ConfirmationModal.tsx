"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
    isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger",
    isLoading = false,
}) => {
    if (!isOpen) return null;

    const colors = {
        danger: "bg-red-600 hover:bg-red-700 text-white",
        warning: "bg-amber-500 hover:bg-amber-600 text-white",
        info: "bg-blue-600 hover:bg-blue-700 text-white",
    };

    const iconColors = {
        danger: "text-red-600 bg-red-50",
        warning: "text-amber-500 bg-amber-50",
        info: "text-blue-600 bg-blue-50",
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${iconColors[type]}`}>
                            <AlertTriangle size={20} />
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-lg font-bold text-primary truncate">{title}</h3>
                            <p className="text-sm text-secondary mt-2 leading-relaxed">
                                {message}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-primary transition-colors mt-1"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="bg-muted px-6 py-4 flex items-center justify-end gap-3 border-t border-border">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2 ${colors[type]}`}
                    >
                        {isLoading && (
                            <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
