"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import ReceiptPrintView from "@/app/dashboard/suppliers/supplies/components/ReceiptPrintView";

export default function SupplyReceiptExportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [receipt, setReceipt] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReceipt = async () => {
            try {
                const res = await fetch(`/api/supplies/receipts/${id}`);
                const json = await res.json();
                if (json.success) {
                    setReceipt(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch receipt:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReceipt();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-400 bg-white">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Preparing Shipment Manifest...</span>
            </div>
        );
    }

    if (!receipt) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
                <h1 className="text-xl font-bold text-primary">Receipt Not Found</h1>
                <button
                    onClick={() => router.back()}
                    className="text-xs font-bold text-secondary hover:text-primary uppercase tracking-widest"
                >
                    Return to ERP
                </button>
            </div>
        );
    }

    return (
        <ReceiptPrintView
            receipt={receipt}
            onClose={() => router.back()}
        />
    );
}
