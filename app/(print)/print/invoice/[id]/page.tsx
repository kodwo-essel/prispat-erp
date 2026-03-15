"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import InvoicePrintView from "@/app/dashboard/invoices/components/InvoicePrintView";

export default function InvoiceExportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await fetch(`/api/finance/${id}`);
                const json = await res.json();
                if (json.success) {
                    setInvoice(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch invoice:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoice();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-400 bg-white">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Preparing Invoice...</span>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
                <h1 className="text-xl font-bold text-primary">Invoice Not Found</h1>
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
        <InvoicePrintView
            invoice={invoice}
            onClose={() => router.back()}
        />
    );
}
