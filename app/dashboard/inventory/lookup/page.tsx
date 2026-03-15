"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function InventoryLookupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sku = searchParams.get("sku");
    const batchId = searchParams.get("batchId");

    useEffect(() => {
        const lookup = async () => {
            if (!sku || !batchId) {
                router.push("/dashboard/inventory");
                return;
            }

            try {
                const res = await fetch(`/api/inventory`);
                const json = await res.json();
                if (json.success) {
                    const match = json.data.find((item: any) =>
                        item.sku === sku && item.batchId === batchId
                    );
                    if (match) {
                        router.replace(`/dashboard/inventory/${match._id}`);
                    } else {
                        // Fallback to search if specific batch not found
                        router.replace(`/dashboard/inventory?search=${sku}`);
                    }
                }
            } catch (error) {
                console.error("Lookup failed:", error);
                router.replace("/dashboard/inventory");
            }
        };

        lookup();
    }, [sku, batchId, router]);

    return (
        <div className="flex-grow flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-400">
            <Loader2 size={32} className="animate-spin text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest">Resolving Asset Identity...</span>
        </div>
    );
}

export default function InventoryLookupPage() {
    return (
        <Suspense fallback={
            <div className="flex-grow flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-400">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Initializing...</span>
            </div>
        }>
            <InventoryLookupContent />
        </Suspense>
    );
}
