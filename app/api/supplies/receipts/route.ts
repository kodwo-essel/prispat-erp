import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SupplyReceipt from "@/models/SupplyReceipt";
import Inventory from "@/models/Inventory";
import Supply from "@/models/Supply";
import Finance from "@/models/Finance";

export async function GET() {
    try {
        await dbConnect();
        const receipts = await SupplyReceipt.find({}).sort({ arrivalDate: -1 });
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
                arrivalDate: arrivalDate
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
                txId: `EXP-REC-${receiptNumber}-${Date.now().toString().slice(-4)}`,
                entity: supplier,
                amount: totalAmount,
                type: "Expense",
                category: "Procurement",
                status: "Settled",
                isInvoice: true,
                date: new Date(arrivalDate),
                description: `Bulk procurement shipment: REF #${receiptNumber} (${items.length} items)`,
                recordedBy: "System Automator",
                auditTrail: [{
                    action: "Auto-generated from Supply Receipt",
                    by: "System Automator",
                    time: new Date()
                }]
            });
        }

        return NextResponse.json({ success: true, data: receipt }, { status: 201 });
    } catch (error: any) {
        console.error("Receipt processing error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
