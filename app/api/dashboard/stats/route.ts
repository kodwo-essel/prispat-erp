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

        // Pending Shipments (Calculated for Invoices, Stored for others)
        const pendingResults = await Finance.aggregate([
            {
                $match: {
                    $or: [
                        { type: "Expense", status: "Pending" },
                        { type: { $in: ["A/R", "Revenue"] }, isInvoice: true }
                    ]
                }
            },
            {
                $lookup: {
                    from: "finances",
                    localField: "txId",
                    foreignField: "parentInvoiceId",
                    pipeline: [{ $match: { status: "Settled" } }],
                    as: "childPayments"
                }
            },
            {
                $addFields: {
                    calculatedStatus: {
                        $cond: {
                            if: {
                                $and: [
                                    { $eq: ["$isInvoice", true] },
                                    { $gt: [{ $size: "$childPayments" }, 0] }
                                ]
                            },
                            then: {
                                $switch: {
                                    branches: [
                                        { case: { $eq: ["$status", "Cancelled"] }, then: "Cancelled" },
                                        { case: { $gte: [{ $sum: "$childPayments.amount" }, "$amount"] }, then: "Settled" },
                                        { case: { $gt: [{ $sum: "$childPayments.amount" }, 0] }, then: "Partial" }
                                    ],
                                    default: "Pending"
                                }
                            },
                            else: "$status"
                        }
                    }
                }
            },
            { $match: { calculatedStatus: "Pending" } }
        ]);
        const pendingShipmentsCount = pendingResults.length;

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

        // 5. Revenue Trend (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const dailyRevenue = await Finance.aggregate([
            {
                $match: {
                    date: { $gte: sevenDaysAgo },
                    type: "Revenue",
                    status: "Settled"
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    amount: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill in missing days with 0
        const trendData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = dailyRevenue.find(r => r._id === dateStr);
            trendData.push({
                date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                revenue: found ? found.amount : 0
            });
        }

        // 6. MTD Revenue & Items
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const mtdRevenue = await Finance.aggregate([
            {
                $match: {
                    date: { $gte: firstDayOfMonth },
                    type: "Revenue",
                    status: "Settled"
                }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const inventorySummary = {
            totalItems: activeInventoryCount,
            lowStock: inventoryItems.filter(i => i.stock < 100).length,
            outOfStock: inventoryItems.filter(i => i.stock === 0).length,
            health: Math.round(((activeInventoryCount - inventoryItems.filter(i => i.stock < 100).length) / activeInventoryCount) * 100) || 0
        };

        // 7. Advanced Analytics (Categorical)
        const inventoryByCategory = await Inventory.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $project: { name: "$_id", value: "$count", _id: 0 } }
        ]);

        const financialDistribution = await Finance.aggregate([
            {
                $match: {
                    date: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
                    status: "Settled"
                }
            },
            { $group: { _id: "$type", value: { $sum: "$amount" } } },
            { $project: { name: "$_id", value: 1, _id: 0 } }
        ]);

        const supplierDistribution = await Supplier.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { name: "$_id", value: "$count", _id: 0 } }
        ]);

        return NextResponse.json({
            success: true,
            data: {
                stats: [
                    { label: "Active Inventory Items", value: activeInventoryCount.toLocaleString(), change: "Live", trend: "neutral" },
                    { label: "Pending Shipments", value: pendingShipmentsCount.toString(), change: "Derived", trend: "neutral" },
                    { label: "Active Suppliers", value: activeSuppliersCount.toString(), change: "Verified", trend: "up" },
                    { label: "Total Asset Value", value: `₵${totalAssetValue.toLocaleString()}`, change: "Calculated", trend: "up" },
                ],
                alerts: alerts.slice(0, 5),
                activities,
                revenueTrend: trendData,
                mtdRevenue: mtdRevenue[0]?.total || 0,
                inventorySummary,
                inventoryByCategory,
                financialDistribution,
                supplierDistribution
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
