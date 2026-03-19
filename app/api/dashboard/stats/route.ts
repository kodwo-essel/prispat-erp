import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Inventory from "@/models/Inventory";
import Supplier from "@/models/Supplier";
import Finance from "@/models/Finance";

export async function GET() {
    try {
        await dbConnect();

        // 1. Inventory Stats
        const inventoryItems = await Inventory.find({});
        const activeInventoryCount = inventoryItems.length;

        // Calculate Total Asset Value (stock * unitPrice)
        const totalAssetValue = inventoryItems.reduce((acc, item) => {
            return acc + (item.stock * (item.unitPrice || 0));
        }, 0);

        // 2. Supplier Stats
        const activeSuppliersCount = await Supplier.countDocuments({ status: "Active" });

        // 3. Dynamic Alerts Grid
        const now = new Date();
        const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

        const alerts: any[] = [];

        // Expiry Alerts (3 Tiers: 30/60/90 days)
        const ninetyDays = 90 * 24 * 60 * 60 * 1000;
        const sixtyDays = 60 * 24 * 60 * 60 * 1000;
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;

        inventoryItems.forEach(item => {
            if (!item.expiryDate) return;
            const expiry = new Date(item.expiryDate).getTime();
            const diffMs = expiry - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            if (diffMs < ninetyDays && item.stock > 0) {
                let severity: "high" | "medium" | "low" = "low";
                let prefix = "WATCHLIST";

                if (diffMs < thirtyDays) {
                    severity = "high";
                    prefix = "CRITICAL EXPIRY";
                } else if (diffMs < sixtyDays) {
                    severity = "medium";
                    prefix = "URGENT EXPIRY";
                }

                alerts.push({
                    type: "EXPIRY",
                    title: `${prefix}: ${item.name}`,
                    description: `${item.stock} ${item.unit} (${item.batchId}) expiring in ${diffDays} days.`,
                    severity,
                    link: `/dashboard/inventory/${item._id}`
                });
            }
        });

        // Low Stock Alerts
        const lowStockItems = inventoryItems.filter(item => item.stock < 100 && item.status !== "Out of Stock");
        lowStockItems.forEach(item => {
            alerts.push({
                type: "STOCK",
                title: `LOW STOCK: ${item.name}`,
                description: `Warehouse threshold breach (${item.stock} units remain).`,
                severity: item.stock < 20 ? "high" : "medium",
                link: `/dashboard/inventory/${item._id}`
            });
        });

        // Pending Shipments (Derived from Pending Finance Transactions of type Expense/Procurement)
        const pendingTransactions = await Finance.find({
            status: "Pending",
            type: { $in: ["Expense", "A/R"] }
        });
        const pendingShipmentsCount = pendingTransactions.length;

        // 4. Recent Activity
        const recentFinance = await Finance.find({})
            .sort({ date: -1 })
            .limit(5);

        const activities = recentFinance.map(tx => ({
            time: formatTimeAgo(tx.date),
            user: tx.recordedBy || "System",
            action: `${tx.type === 'Revenue' ? 'Received' : 'Logged'} ${tx.amount.toLocaleString()} - ${tx.entity}`,
            status: tx.status,
            type: tx.type
        }));

        return NextResponse.json({
            success: true,
            data: {
                stats: [
                    { label: "Active Inventory Items", value: activeInventoryCount.toLocaleString(), change: "Live", trend: "neutral" },
                    { label: "Pending Shipments", value: pendingShipmentsCount.toString(), change: "Derived", trend: "neutral" },
                    { label: "Active Suppliers", value: activeSuppliersCount.toString(), change: "Verified", trend: "up" },
                    { label: "Total Asset Value", value: `₵${totalAssetValue.toLocaleString()}`, change: "Calculated", trend: "up" },
                ],
                alerts: alerts.slice(0, 5), // Limit to top 5 alerts
                activities
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

function formatTimeAgo(date: Date) {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 60) return `${diffInMins} min ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${diffInDays} days ago`;
}
