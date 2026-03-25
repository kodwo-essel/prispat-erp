import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Inventory from "@/models/Inventory";
import Supplier from "@/models/Supplier";
import Finance from "@/models/Finance";
import Customer from "@/models/Customer";
import Staff from "@/models/Staff";

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { startDate, endDate, services } = await request.json();

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const reportData: any = {};

        // ── INVENTORY ──────────────────────────────────────────────
        if (services.includes("inventory")) {
            const items = await Inventory.find({});
            const totalAssetValue = items.reduce((acc, i) => acc + ((i.supplierPrice || i.unitPrice || 0) * i.stock), 0);
            const avgUnitPrice = items.length > 0 ? items.reduce((acc, i) => acc + (i.unitPrice || 0), 0) / items.length : 0;
            const lowStockThreshold = 100;

            // Category breakdown
            const categoryMap: Record<string, { count: number; value: number }> = {};
            items.forEach(i => {
                const cat = i.category || "Uncategorised";
                if (!categoryMap[cat]) categoryMap[cat] = { count: 0, value: 0 };
                categoryMap[cat].count++;
                categoryMap[cat].value += (i.supplierPrice || i.unitPrice || 0) * i.stock;
            });

            reportData.inventory = {
                totalItems: items.length,
                lowStock: items.filter(i => i.stock < lowStockThreshold && i.stock > 0).length,
                outOfStock: items.filter(i => i.stock === 0).length,
                totalStockUnits: items.reduce((acc, i) => acc + i.stock, 0),
                totalAssetValue,
                avgUnitPrice,
                categoryBreakdown: Object.entries(categoryMap).map(([name, d]) => ({
                    category: name,
                    skus: d.count,
                    value: d.value
                })).sort((a, b) => b.value - a.value)
            };
        }

        // ── FINANCE ───────────────────────────────────────────────
        if (services.includes("finance")) {
            const txs = await Finance.aggregate([
                { $match: { date: { $gte: start, $lte: end } } },
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
                }
            ]);

            // Settled standalone revenue payments (not invoices themselves)
            const revenue = txs
                .filter(t => (t.type === "Revenue" || t.type === "A/R") && !t.isInvoice && t.status === "Settled")
                .reduce((acc, t) => acc + (t.amount || 0), 0);

            const expenses = txs
                .filter(t => t.type === "Expense" && !t.isInvoice && t.status === "Settled")
                .reduce((acc, t) => acc + (t.amount || 0), 0);

            const payroll = txs
                .filter(t => t.type === "Payroll" && t.status === "Settled")
                .reduce((acc, t) => acc + (t.amount || 0), 0);

            const tax = txs
                .filter(t => t.type === "Tax" && t.status === "Settled")
                .reduce((acc, t) => acc + (t.amount || 0), 0);

            const totalOutflows = expenses + payroll + tax;
            const net = revenue - totalOutflows;
            const opRatio = revenue > 0 ? (totalOutflows / revenue) * 100 : 0;
            const netMargin = revenue > 0 ? (net / revenue) * 100 : 0;

            // A/R: outstanding revenue invoices
            const allInvoices = await Finance.aggregate([
                { $match: { isInvoice: true, status: { $nin: ["Settled", "Cancelled"] } } },
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
                        totalPaid: { $sum: "$childPayments.amount" },
                        balanceDue: { $subtract: ["$amount", { $sum: "$childPayments.amount" }] }
                    }
                }
            ]);
            const accountsReceivable = allInvoices
                .filter(inv => inv.type === "Revenue" || inv.type === "A/R")
                .reduce((acc, inv) => acc + Math.max(inv.balanceDue, 0), 0);
            const accountsPayable = allInvoices
                .filter(inv => inv.type === "Expense")
                .reduce((acc, inv) => acc + Math.max(inv.balanceDue, 0), 0);

            // Transaction count excluding child payments
            const totalTransactions = txs.filter(t => !t.parentInvoiceId).length;
            const settledInvoices = txs.filter(t => t.isInvoice && t.totalPaid >= t.amount).length;
            const pendingInvoices = txs.filter(t => t.isInvoice && t.totalPaid < t.amount && t.status !== "Cancelled").length;

            // Category breakdown for expenses
            const expenseCategoryMap: Record<string, number> = {};
            txs.filter(t => ["Expense", "Payroll", "Tax"].includes(t.type) && t.status === "Settled").forEach(t => {
                const cat = t.category || t.type;
                expenseCategoryMap[cat] = (expenseCategoryMap[cat] || 0) + t.amount;
            });

            reportData.finance = {
                revenue,
                expenses: totalOutflows,
                expenseBreakdown: { procurement: expenses, payroll, tax },
                net,
                opRatio,
                netMargin,
                accountsReceivable,
                accountsPayable,
                totalTransactions,
                settledInvoices,
                pendingInvoices,
                expenseCategoryBreakdown: Object.entries(expenseCategoryMap)
                    .map(([cat, amt]) => ({ category: cat, amount: amt }))
                    .sort((a, b) => b.amount - a.amount)
            };
        }

        // ── SUPPLIERS ─────────────────────────────────────────────
        if (services.includes("suppliers")) {
            const suppliers = await Supplier.find({});
            const countryMap: Record<string, number> = {};
            suppliers.forEach(s => {
                const c = s.country || "Unknown";
                countryMap[c] = (countryMap[c] || 0) + 1;
            });
            reportData.suppliers = {
                totalSuppliers: suppliers.length,
                activeSuppliers: suppliers.filter(s => s.status === "Active").length,
                onHoldSuppliers: suppliers.filter(s => s.status === "Hold").length,
                inactiveSuppliers: suppliers.filter(s => s.status === "Inactive").length,
                countryBreakdown: Object.entries(countryMap)
                    .map(([country, count]) => ({ country, count }))
                    .sort((a, b) => b.count - a.count)
            };
        }

        // ── SUPPLIES ──────────────────────────────────────────────
        if (services.includes("supplies")) {
            const supplies = await Finance.find({
                date: { $gte: start, $lte: end },
                type: "Expense",
                category: { $in: ["Procurement", "Supply"] }
            });

            const settled = supplies.filter(s => s.status === "Settled");
            const unpaid = supplies.filter(s => s.status === "Unpaid");
            const partial = supplies.filter(s => s.status === "Partial");

            const totalValue = supplies.reduce((acc, s) => acc + s.amount, 0);
            const settledValue = settled.reduce((acc, s) => acc + s.amount, 0);
            const outstandingValue = [...unpaid, ...partial].reduce((acc, s) => acc + s.amount, 0);

            reportData.supplies = {
                totalCycles: supplies.length,
                totalValue,
                settledCycles: settled.length,
                settledValue,
                unpaidCycles: unpaid.length,
                partialCycles: partial.length,
                outstandingValue,
                paymentRate: totalValue > 0 ? (settledValue / totalValue) * 100 : 0
            };
        }

        // ── CUSTOMERS ─────────────────────────────────────────────
        if (services.includes("customers")) {
            const customers = await Customer.find({});
            const newRegistrations = await Customer.countDocuments({ createdAt: { $gte: start, $lte: end } });
            reportData.customers = {
                totalCustomers: customers.length,
                activeCustomers: customers.filter(c => c.status === "Active").length,
                inactiveCustomers: customers.filter(c => c.status !== "Active").length,
                newRegistrations
            };
        }

        // ── SALES ─────────────────────────────────────────────────
        if (services.includes("sales")) {
            const salesInvoices = await Finance.aggregate([
                {
                    $match: {
                        date: { $gte: start, $lte: end },
                        type: { $in: ["Revenue", "A/R"] },
                        isInvoice: true,
                        status: { $ne: "Cancelled" }
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
                }
            ]);

            const grossSalesValue = salesInvoices.reduce((acc, s) => acc + (s.amount || 0), 0);
            const collectedValue = salesInvoices.reduce((acc, s) => acc + (s.totalPaid || 0), 0);
            const settledCount = salesInvoices.filter(s => s.totalPaid >= s.amount).length;
            const pendingCount = salesInvoices.filter(s => s.totalPaid < s.amount).length;
            const avgOrderValue = salesInvoices.length > 0 ? grossSalesValue / salesInvoices.length : 0;
            const collectionRate = grossSalesValue > 0 ? (collectedValue / grossSalesValue) * 100 : 0;

            reportData.sales = {
                totalInvoices: salesInvoices.length,
                grossSalesValue,
                collectedValue,
                outstandingValue: grossSalesValue - collectedValue,
                settledCount,
                pendingCount,
                avgOrderValue,
                collectionRate
            };
        }

        // ── STAFF ─────────────────────────────────────────────────
        if (services.includes("staff")) {
            const staff = await Staff.find({});
            const roleMap: Record<string, number> = {};
            staff.forEach(s => {
                const r = s.role || "Staff";
                roleMap[r] = (roleMap[r] || 0) + 1;
            });
            reportData.staff = {
                totalEmployees: staff.length,
                activeEmployees: staff.filter(s => s.status === "Active").length,
                inactiveEmployees: staff.filter(s => s.status !== "Active").length,
                adminCount: staff.filter(s => s.role === "Admin").length,
                roleBreakdown: Object.entries(roleMap)
                    .map(([role, count]) => ({ role, count }))
                    .sort((a, b) => b.count - a.count)
            };
        }

        return NextResponse.json({ success: true, data: reportData });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
