import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Inventory from "@/models/Inventory";
import Supply from "@/models/Supply";

export async function GET() {
    try {
        await dbConnect();
        const items = await Inventory.find({}).sort({ updatedAt: -1 });
        return NextResponse.json({ success: true, data: items });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // 1. Log the discrete Supply event
        const supplyEntry = {
            name: body.name,
            sku: body.sku,
            category: body.category,
            quantity: body.stock, // In the form, it's captured as 'stock'
            unit: body.unit,
            hazardClass: body.hazardClass,
            batchId: body.batchId,
            expiryDate: body.expiryDate,
            supplier: body.supplier,
            unitPrice: body.unitPrice,
            supplierPrice: body.supplierPrice || 0
        };
        await Supply.create(supplyEntry);

        // 2. Update the aggregate Inventory state
        let inventoryItem = await Inventory.findOne({
            sku: body.sku,
            supplier: body.supplier,
            batchId: body.batchId
        });

        if (inventoryItem) {
            // Increment existing stock
            inventoryItem.stock += Number(body.stock);
            inventoryItem.unitPrice = body.unitPrice; // Update to latest selling price
            inventoryItem.supplierPrice = body.supplierPrice || 0; // Update to latest cost price
            inventoryItem.expiryDate = body.expiryDate; // Update to latest expiry
            inventoryItem.status = inventoryItem.stock > 0 ? "In Stock" : "Low Inventory";
            await inventoryItem.save();
        } else {
            // Create new inventory record
            inventoryItem = await Inventory.create({
                ...body,
                supplierPrice: body.supplierPrice || 0
            });
        }

        // 3. Create an "Expense" type invoice for the supplier if supplierPrice is provided
        if (body.supplierPrice && body.supplierPrice > 0) {
            const Finance = (await import("@/models/Finance")).default;
            const suffix = `${Date.now().toString().slice(-8)}`;
            const expenseInvoice = {
                txId: `INV-${suffix}`,
                entity: body.supplier,
                type: "Expense",
                category: "Procurement Cost",
                amount: Number(body.supplierPrice) * Number(body.stock),
                date: new Date(),
                status: "Pending",
                isInvoice: true,
                description: `Automatic expense for ${body.stock} ${body.unit} of ${body.name} (SKU: ${body.sku}, Batch: ${body.batchId})`,
                recordedBy: "System Automator"
            };
            await Finance.create(expenseInvoice);
        }

        return NextResponse.json({ success: true, data: inventoryItem }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
