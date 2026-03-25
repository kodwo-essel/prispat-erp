"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import InvoicePrintView from "@/app/dashboard/invoices/components/InvoicePrintView";

export default function InvoiceExportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [invoice, setInvoice] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await fetch(`/api/finance/${id}`);
                const json = await res.json();
                if (json.success) {
                    const invData = json.data;
                    // If invoice is linked to an order, fetch order details for line items
                    if (invData.orderId) {
                        try {
                            const ordRes = await fetch(`/api/orders/${invData.orderId}`);
                            const ordJson = await ordRes.json();
                            if (ordJson.success) {
                                // Merge order items into invoice for the print view
                                invData.items = ordJson.data.items;
                            }
                        } catch (e) {
                            console.error("Failed to fetch linked order:", e);
                        }
                    } else if (invData.type === "Expense") {
                        // For procurement invoices, fetch the supply receipt by exact invoiceId
                        try {
                            const srRes = await fetch(`/api/supplies/receipts?invoiceId=${invData.txId}`);
                            const srJson = await srRes.json();
                            if (srJson.success && srJson.data.length > 0) {
                                // Merge supply receipt items into invoice for the print view
                                invData.items = srJson.data[0].items;
                            }
                        } catch (e) {
                            console.error("Failed to fetch linked supply receipt:", e);
                        }
                    }
                    // Fetch child payment records
                    try {
                        const payRes = await fetch(`/api/finance?parentInvoiceId=${invData.txId}`);
                        const payJson = await payRes.json();
                        if (payJson.success) setPayments(payJson.data || []);
                    } catch (e) {
                        console.error("Failed to fetch child payments:", e);
                    }
                    setInvoice(invData);
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
            payments={payments}
            onClose={() => router.back()}
        />
    );
}
