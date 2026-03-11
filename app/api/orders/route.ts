import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Inventory from "@/models/Inventory";
import Finance from "@/models/Finance";

export async function GET() {
    try {
        await dbConnect();
        const orders = await Order.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: orders });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { customer, items, totalAmount, recordedBy } = body;

        // 1. Validate Stock Availability (Batch-Specific)
        for (const item of items) {
            const invItem = await Inventory.findOne({ sku: item.sku, batchId: item.batchId });
            if (!invItem || invItem.stock < item.quantity) {
                return NextResponse.json({
                    success: false,
                    error: `Insufficient stock for ${item.name} (Batch: ${item.batchId}). Available: ${invItem?.stock || 0}`
                }, { status: 400 });
            }
        }

        // 2. Perform Atomic Inventory Reductions (Batch-Specific)
        for (const item of items) {
            await Inventory.findOneAndUpdate(
                { sku: item.sku, batchId: item.batchId },
                { $inc: { stock: -item.quantity } }
            );
        }

        // 3. Create Finance Transaction (Revenue or A/R)
        const txId = `TX-${Date.now()}`;
        await Finance.create({
            txId,
            entity: customer.name,
            type: "Revenue",
            amount: totalAmount,
            category: "Sales Fulfillment",
            recordedBy: recordedBy || "System Automator",
            status: "Settled",
            description: `Order dispatch for ${customer.name}`
        });

        // 4. Create the Order Record
        const orderId = `ORD-${Date.now()}`;
        const newOrder = await Order.create({
            orderId,
            customer,
            items,
            totalAmount,
            status: "Dispatched",
            dispatchDate: new Date()
        });

        return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
