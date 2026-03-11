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
            unitPrice: body.unitPrice
        };
        await Supply.create(supplyEntry);

        // 2. Update the aggregate Inventory state
        let inventoryItem = await Inventory.findOne({ sku: body.sku });

        if (inventoryItem) {
            // Increment existing stock
            inventoryItem.stock += Number(body.stock);
            inventoryItem.unitPrice = body.unitPrice; // Update to latest price
            inventoryItem.expiryDate = body.expiryDate; // Update to latest expiry
            inventoryItem.status = inventoryItem.stock > 0 ? "In Stock" : "Low Inventory";
            await inventoryItem.save();
        } else {
            // Create new inventory record
            inventoryItem = await Inventory.create(body);
        }

        return NextResponse.json({ success: true, data: inventoryItem }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
