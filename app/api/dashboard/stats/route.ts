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

        // Expiry Alerts
        const expiringItems = inventoryItems.filter(item =>
            item.expiryDate && new Date(item.expiryDate) < threeMonthsFromNow
        );
        expiringItems.forEach(item => {
            const diffDays = Math.ceil((new Date(item.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            alerts.push({
                type: "EXPIRY",
                title: `EXPIRY WARNING: ${item.name}`,
                description: `${item.stock} ${item.unit} expiring in ${diffDays} days.`,
                severity: diffDays < 30 ? "high" : "medium"
            });
        });

        // Low Stock Alerts
        const lowStockItems = inventoryItems.filter(item => item.stock < 100 && item.status !== "Out of Stock");
        lowStockItems.forEach(item => {
            alerts.push({
                type: "STOCK",
                title: `LOW STOCK: ${item.name}`,
                description: `Warehouse threshold breach (${item.stock} units remain).`,
                severity: item.stock < 20 ? "high" : "medium"
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
