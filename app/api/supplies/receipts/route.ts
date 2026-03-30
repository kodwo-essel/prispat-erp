import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SupplyReceipt from "@/models/SupplyReceipt";
import Inventory from "@/models/Inventory";
import Supply from "@/models/Supply";
import Finance from "@/models/Finance";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const receiptNumber = searchParams.get("receiptNumber");
        const invoiceId = searchParams.get("invoiceId");
        const supplier = searchParams.get("supplier");

        let match: any = {};
        if (invoiceId) match.invoiceId = invoiceId;
        else if (receiptNumber) match.receiptNumber = receiptNumber;
        else if (supplier) match.supplier = { $regex: new RegExp(supplier, "i") };

        const receipts = await SupplyReceipt.aggregate([
            { $match: match },
            { $sort: { arrivalDate: -1 } },
            {
                $lookup: {
                    from: "finances",
                    localField: "invoiceId",
                    foreignField: "txId",
                    as: "financeData"
                }
            },
            {
                $addFields: {
                    financeRecord: { $arrayElemAt: ["$financeData", 0] }
                }
            },
            // Include payment aggregation logic similarly to finance/[id]
            {
                $lookup: {
                    from: "finances",
                    localField: "invoiceId",
                    foreignField: "parentInvoiceId",
                    pipeline: [{ $match: { status: "Settled" } }],
                    as: "childPayments"
                }
            },
            {
                $addFields: {
                    "financeRecord.totalPaid": { $sum: "$childPayments.amount" }
                }
            },
            {
                $addFields: {
                    "financeRecord.status": {
                        $cond: {
                            if: { $gt: [{ $sum: "$childPayments.amount" }, 0] },
                            then: {
                                $cond: {
                                    if: { $gte: [{ $sum: "$childPayments.amount" }, "$financeRecord.amount"] },
                                    then: "Settled",
                                    else: "Partial"
                                }
                            },
                            else: { $ifNull: ["$financeRecord.status", "Unpaid"] }
                        }
                    }
                }
            },
            { $project: { financeData: 0, childPayments: 0 } }
        ]);

        return NextResponse.json({ success: true, data: receipts });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { items, supplier, arrivalDate, receiptNumber, notes } = body;

        // 1. Calculate and Create the Supply Receipt
        // Total amount is based on CUSTOMER COST (supplierPrice)
        const totalAmount = items.reduce((sum: number, item: any) => sum + (Number(item.supplierPrice || 0) * item.quantity), 0);
        const receipt = await SupplyReceipt.create({
            items,
            supplier,
            arrivalDate,
            receiptNumber,
            notes,
            totalAmount
        });

        const txId = `EXP-REC-${receiptNumber}-${Date.now().toString().slice(-4)}`;

        // 2. Process each item for Inventory and Supply Audit
        for (const item of items) {
            // Log individual Supply event
            await Supply.create({
                name: item.name,
                sku: item.sku,
                category: item.category,
                quantity: item.quantity,
                unit: item.unit,
                hazardClass: item.hazardClass || "None",
                batchId: item.batchId,
                expiryDate: item.expiryDate,
                supplier: supplier,
                unitPrice: item.unitPrice, // Latest selling price
                supplierPrice: item.supplierPrice, // Latest cost price
                arrivalDate: arrivalDate,
                invoiceId: txId
            });

            // Update/Create Aggregate Inventory
            let inventoryItem = await Inventory.findOne({
                sku: item.sku,
                supplier: supplier,
                batchId: item.batchId
            });

            if (inventoryItem) {
                // Increment existing stock
                inventoryItem.stock += Number(item.quantity);
                inventoryItem.unitPrice = item.unitPrice;
                inventoryItem.supplierPrice = item.supplierPrice;
                inventoryItem.expiryDate = item.expiryDate;
                inventoryItem.status = inventoryItem.stock > 0 ? "In Stock" : "Low Inventory";
                await inventoryItem.save();
            } else {
                // Create new inventory record
                await Inventory.create({
                    name: item.name,
                    sku: item.sku,
                    category: item.category,
                    stock: Number(item.quantity),
                    unit: item.unit,
                    hazardClass: item.hazardClass,
                    batchId: item.batchId,
                    expiryDate: item.expiryDate,
                    supplier: supplier,
                    unitPrice: item.unitPrice,
                    supplierPrice: item.supplierPrice,
                    status: "In Stock"
                });
            }
        }

        // 3. Automated Expense Logging for the shipment
        if (totalAmount > 0) {
            await Finance.create({
                txId: txId,
                entity: supplier,
                amount: totalAmount,
                type: "Expense",
                category: "Procurement",
                status: "Unpaid",
                isInvoice: true,
                date: new Date(arrivalDate),
                description: `Bulk procurement shipment: REF #${receiptNumber} (${items.length} items)`,
                recordedBy: "System Automator",
                auditTrail: [{
                    action: "Auto-generated from Supply Receipt (Unpaid)",
                    by: "System Automator",
                    time: new Date()
                }]
            });

            // Update receipt with invoiceId
            receipt.invoiceId = txId;
            await receipt.save();
        }

        return NextResponse.json({ success: true, data: receipt }, { status: 201 });
    } catch (error: any) {
        console.error("Receipt processing error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
