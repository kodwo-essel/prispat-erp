import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Inventory from "@/models/Inventory";
import Supplier from "@/models/Supplier";
import Finance from "@/models/Finance";
import SystemConfig from "@/models/SystemConfig";

export async function GET() {
    try {
        await dbConnect();

        // 0. Fetch Global Config
        const config = await SystemConfig.findOne({}) || {
            organizationName: "Prispat Prime Distribution",
            systemNodeId: "GH-ACCRA-CORE-01"
        };

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
        const lowStockItems = inventoryItems.filter(item => item.stock < 25 && item.status !== "Out of Stock");
        lowStockItems.forEach(item => {
            alerts.push({
                type: "STOCK",
                title: `${item.stock < 10 ? 'CRITICAL LOW' : 'LOW STOCK'}: ${item.name}`,
                description: `Warehouse threshold breach (${item.stock} units remain).`,
                severity: item.stock < 10 ? "high" : "medium",
                link: `/dashboard/inventory/${item._id}`
            });
        });

        // Pending Financials (A/R and A/P)
        const allInvoices = await Finance.aggregate([
            {
                $match: {
                    isInvoice: true,
                    status: { $nin: ["Settled", "Cancelled"] }
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
                    totalPaid: { $sum: "$childPayments.amount" }
                }
            },
            {
                $addFields: {
                    balanceDue: { $subtract: ["$amount", "$totalPaid"] }
                }
            }
        ]);

        const totalReceivable = allInvoices
            .filter(inv => inv.type === "Revenue" || inv.type === "A/R")
            .reduce((acc, inv) => acc + inv.balanceDue, 0);

        const totalPayable = allInvoices
            .filter(inv => inv.type === "Expense")
            .reduce((acc, inv) => acc + inv.balanceDue, 0);

        const pendingShipmentsCount = allInvoices.length;

        // Net Liquidity = settled revenue - settled expenditure (all-time)
        const netLiquidityData = await Finance.aggregate([
            { $match: { status: "Settled", isInvoice: { $ne: true } } },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: { $cond: [{ $in: ["$type", ["Revenue", "A/R", "Settlement"]] }, "$amount", 0] } },
                    expenses: { $sum: { $cond: [{ $in: ["$type", ["Expense", "Payroll", "Tax"]] }, "$amount", 0] } }
                }
            }
        ]);
        const netLiquidity = (netLiquidityData[0]?.revenue || 0) - (netLiquidityData[0]?.expenses || 0);

        // 4. Recent Activity
        const recentFinance = await Finance.find({})
            .sort({ date: -1 })
            .limit(8);

        const activities = recentFinance.map(tx => ({
            time: formatTimeAgo(tx.date),
            user: tx.recordedBy || "System",
            action: `${tx.type === 'Revenue' || tx.type === 'Settlement' ? 'Received' : 'Logged'} ₵${tx.amount.toLocaleString()} - ${tx.entity}`,
            status: tx.status,
            type: tx.type
        }));

        // 5. 30-Day Financial Analytics (Time-series)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const dailyFinancials = await Finance.aggregate([
            {
                $match: {
                    date: { $gte: thirtyDaysAgo },
                    status: "Settled"
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    revenue: { $sum: { $cond: [{ $in: ["$type", ["Revenue", "A/R", "Settlement"]] }, "$amount", 0] } },
                    expenses: { $sum: { $cond: [{ $in: ["$type", ["Expense", "Payroll", "Tax"]] }, "$amount", 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill in missing days for the last 30 days
        const revenueTrend = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = dailyFinancials.find(r => r._id === dateStr);
            revenueTrend.push({
                date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                revenue: found ? found.revenue : 0,
                expenses: found ? found.expenses : 0,
                profit: found ? found.revenue - found.expenses : 0
            });
        }

        // 6. Inventory Value Trend (30-day Reconstruction)
        const SupplyReceipt = (await import("@/models/SupplyReceipt")).default;
        const inventoryValData = await Inventory.aggregate([
            { $group: { _id: null, total: { $sum: { $multiply: ["$stock", { $ifNull: ["$unitPrice", 0] }] } } } }
        ]);
        const currentInventoryValue = inventoryValData[0]?.total || 0;

        // Fetch daily inflows (Procurement)
        const dailyInflows = await SupplyReceipt.aggregate([
            { $match: { arrivalDate: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$arrivalDate" } },
                    amount: { $sum: "$totalAmount" }
                }
            }
        ]);

        // Fetch daily outflows (Approximate COGS from Sales)
        // We use 70% of Revenue as a COGS proxy if precise batch costs aren't linked to Finance records
        const dailyOutflows = await Finance.aggregate([
            {
                $match: {
                    date: { $gte: thirtyDaysAgo },
                    type: { $in: ["Revenue", "A/R", "Settlement"] },
                    status: "Settled",
                    isInvoice: false
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    amount: { $sum: { $multiply: ["$amount", 0.7] } }
                }
            }
        ]);

        // Reconstruct 30-day trend walking backwards
        const inventoryTrend = [];
        let runningValue = currentInventoryValue;

        // We fill indices 0 to 29 (30 days total)
        // We process from Today (Day 29) down to 0
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            const inflow = dailyInflows.find(r => r._id === dateStr)?.amount || 0;
            const outflow = dailyOutflows.find(r => r._id === dateStr)?.amount || 0;

            inventoryTrend.push({
                date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                value: Math.max(0, runningValue)
            });

            // "Rewind" the value for the previous day
            runningValue = runningValue - inflow + outflow;
        }
        inventoryTrend.reverse(); // Standardize to chronological order

        // Weekly Revenue Calculation for KPI
        const currentDay = now.getDay();
        const daysSinceMonday = (currentDay === 0 ? 6 : currentDay - 1);
        const thisMonday = new Date(now);
        thisMonday.setDate(now.getDate() - daysSinceMonday);
        thisMonday.setHours(0, 0, 0, 0);
        const lastMonday = new Date(thisMonday);
        lastMonday.setDate(thisMonday.getDate() - 7);

        const weeklyRevenueData = await Finance.aggregate([
            {
                $match: {
                    date: { $gte: lastMonday },
                    type: { $in: ["Revenue", "A/R", "Settlement"] },
                    isInvoice: false,
                    status: "Settled"
                }
            },
            {
                $group: {
                    _id: { $cond: [{ $gte: ["$date", thisMonday] }, "current", "previous"] },
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const weeklyRevenue = weeklyRevenueData.find(r => r._id === "current")?.total || 0;
        const previousWeeklyRevenue = weeklyRevenueData.find(r => r._id === "previous")?.total || 0;
        const revDiff = weeklyRevenue - previousWeeklyRevenue;
        const revPercent = previousWeeklyRevenue > 0 ? (revDiff / previousWeeklyRevenue) * 100 : (weeklyRevenue > 0 ? 100 : 0);

        // MTD Revenue
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const mtdRevenueData = await Finance.aggregate([
            {
                $match: {
                    date: { $gte: firstDayOfMonth },
                    type: { $in: ["Revenue", "A/R", "Settlement"] },
                    isInvoice: false,
                    status: "Settled"
                }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const mtdRevenue = mtdRevenueData[0]?.total || 0;

        // Today's Stats
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        const todayStatsData = await Finance.aggregate([
            {
                $match: {
                    date: { $gte: todayStart, $lte: todayEnd },
                    status: "Settled"
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: { $cond: [{ $in: ["$type", ["Revenue", "A/R", "Settlement"]] }, "$amount", 0] } },
                    expenses: { $sum: { $cond: [{ $in: ["$type", ["Expense", "Payroll", "Tax"]] }, "$amount", 0] } }
                }
            }
        ]);
        const todayRevenue = todayStatsData[0]?.revenue || 0;
        const todayExpenses = todayStatsData[0]?.expenses || 0;

        // Inventory health summary
        const inventorySummary = {
            totalItems: activeInventoryCount,
            lowStock: inventoryItems.filter(i => i.stock < 100).length,
            outOfStock: inventoryItems.filter(i => i.stock === 0).length,
            health: Math.round(((activeInventoryCount - inventoryItems.filter(i => i.stock < 100).length) / activeInventoryCount) * 100) || 0,
            value: currentInventoryValue
        };

        // 7. Advanced Analytics (Categorical)
        const inventoryByCategory = await Inventory.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $project: { name: "$_id", value: "$count", _id: 0 } }
        ]);

        const financialDistribution = await Finance.aggregate([
            {
                $match: {
                    date: { $gte: thirtyDaysAgo },
                    status: "Settled"
                }
            },
            {
                $group: {
                    _id: "$type",
                    value: { $sum: "$amount" }
                }
            },
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
                    { label: "Net Liquidity", value: `₵${netLiquidity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: "Cash Position", trend: netLiquidity >= 0 ? "up" : "down" },
                    { label: "Today's Revenue", value: `₵${todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: "Today", trend: "up" },
                    { label: "Today's Expenses", value: `₵${todayExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: "Today", trend: "down" },
                    { label: "Weekly Revenue", value: `₵${weeklyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: `${revPercent >= 0 ? '+' : ''}${revPercent.toFixed(1)}%`, trend: revPercent >= 0 ? "up" : "down" },
                    { label: "Accounts Receivable", value: `₵${totalReceivable.toLocaleString()}`, change: "Expected", trend: "neutral" },
                    { label: "Accounts Payable", value: `₵${totalPayable.toLocaleString()}`, change: "Outstanding", trend: "down" },
                    { label: "Total Asset Value", value: `₵${totalAssetValue.toLocaleString()}`, change: "Calculated", trend: "up" },
                ],
                alerts: alerts.slice(0, 5),
                activities,
                revenueTrend,
                inventoryTrend,
                mtdRevenue,
                inventorySummary,
                inventoryByCategory,
                financialDistribution,
                supplierDistribution,
                config: {
                    organizationName: config.organizationName,
                    systemNodeId: config.systemNodeId
                }
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
