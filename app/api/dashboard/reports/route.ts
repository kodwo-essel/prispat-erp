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

        if (services.includes("inventory")) {
            const items = await Inventory.find({});
            reportData.inventory = {
                totalItems: items.length,
                lowStock: items.filter(i => i.stock < 100).length,
                metrics: {
                    totalStockUnits: items.reduce((acc, i) => acc + i.stock, 0),
                    outOfStockItems: items.filter(i => i.stock === 0).length,
                    averageUnitPrice: items.length > 0 ? items.reduce((acc, i) => acc + (i.unitPrice || 0), 0) / items.length : 0
                }
            };
        }

        if (services.includes("finance")) {
            const txs = await Finance.find({
                date: { $gte: start, $lte: end }
            });
            const revenue = txs.filter(t => t.type === "Revenue" && t.status === "Settled").reduce((acc, t) => acc + t.amount, 0);
            const expenses = txs.filter(t => t.type === "Expense").reduce((acc, t) => acc + t.amount, 0);

            reportData.finance = {
                revenue,
                expenses,
                metrics: {
                    totalTransactions: txs.length,
                    pendingCollections: txs.filter(t => t.status === "Pending" && t.type === "A/R").reduce((acc, t) => acc + t.amount, 0),
                    settledPayments: txs.filter(t => t.status === "Settled").length
                }
            };
        }

        if (services.includes("suppliers")) {
            const suppliers = await Supplier.find({});
            reportData.suppliers = {
                metrics: {
                    totalSuppliers: suppliers.length,
                    activeSuppliers: suppliers.filter(s => s.status === "Active").length,
                    onHoldSuppliers: suppliers.filter(s => s.status === "Hold").length
                }
            };
        }

        if (services.includes("supplies")) {
            const supplies = await Finance.find({
                date: { $gte: start, $lte: end },
                type: "Expense",
                category: { $in: ["Procurement", "Supply"] }
            });
            reportData.supplies = {
                metrics: {
                    procurementCycles: supplies.length,
                    totalProcuredValue: supplies.reduce((acc, s) => acc + s.amount, 0),
                    topSupplyCategory: "Pharma/Core"
                }
            };
        }

        if (services.includes("customers")) {
            const customers = await Customer.find({});
            reportData.customers = {
                metrics: {
                    totalCustomers: customers.length,
                    verifiedAccounts: customers.filter(c => c.status === "Active").length,
                    newRegistrations: await Customer.countDocuments({ createdAt: { $gte: start, $lte: end } })
                }
            };
        }

        if (services.includes("sales")) {
            const sales = await Finance.find({
                date: { $gte: start, $lte: end },
                type: "Revenue"
            });
            reportData.sales = {
                metrics: {
                    completedSalesLines: sales.length,
                    grossSalesValue: sales.reduce((acc, s) => acc + s.amount, 0),
                    averageOrderValue: sales.length > 0 ? sales.reduce((acc, s) => acc + s.amount, 0) / sales.length : 0
                }
            };
        }

        if (services.includes("staff")) {
            const staff = await Staff.find({});
            reportData.staff = {
                metrics: {
                    totalEmployees: staff.length,
                    activeDirectory: staff.filter(s => s.status === "Active").length,
                    administrativeRole: staff.filter(s => s.role === "Admin").length
                }
            };
        }

        return NextResponse.json({ success: true, data: reportData });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
