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
        const { customer, items, totalAmount, recordedBy, saleType } = body;

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
        const orderId = `ORD-${Date.now()}`;
        const invId = `INV-${Date.now()}`;   // Invoice always gets INV- prefix
        const isCreditSale = saleType === "Credit";

        // Create the Invoice record
        const invoice = await Finance.create({
            txId: invId,
            orderId,
            entity: customer.name,
            type: isCreditSale ? "A/R" : "Revenue",
            amount: totalAmount,
            category: "Sales Fulfillment",
            recordedBy: recordedBy || "System Automator",
            status: isCreditSale ? "Unpaid" : "Pending",   // status is derived from payments, not stored
            description: `Invoice for Order ${orderId}`,
            isInvoice: true,
            totalPaid: 0,           // always 0 — real total is calculated from child payments
            date: new Date()
        });

        // Every invoice gets a child payment record.
        // Cash sale = one immediate Settled payment.
        // Credit sale = no payment yet (PAY- records added later as money comes in).
        if (!isCreditSale) {
            await Finance.create({
                txId: `PAY-${Date.now()}`,
                parentInvoiceId: invId,
                entity: customer.name,
                type: "Revenue",
                amount: totalAmount,
                category: "Sales Fulfillment",
                recordedBy: recordedBy || "System Automator",
                status: "Settled",
                description: `Cash payment for Invoice ${invId}`,
                isInvoice: false,
                totalPaid: 0,
                date: new Date()
            });
        }

        // 4. Create the Order Record
        const newOrder = await Order.create({
            orderId,
            customer,
            items,
            totalAmount,
            status: isCreditSale ? "Dispatched" : "Received",
            dispatchDate: new Date(),
            txId: invId,          // reference points to the INV- invoice record
            saleType: saleType || "Credit"
        });

        return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
