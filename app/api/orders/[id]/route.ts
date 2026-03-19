import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Inventory from "@/models/Inventory";

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const body = await request.json();
        const { id } = params;

        const updateData: any = {};
        if (body.status) updateData.status = body.status;
        if (body.dispatchDate) updateData.dispatchDate = new Date(body.dispatchDate);

        const order = await Order.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!order) {
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: order });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = params;

        const order = await Order.findById(id);
        if (!order) {
            return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
        }

        // If cancelling, restock inventory if it was already deducted (status Dispatched or Delivered)
        if (order.status !== 'Cancelled') {
            for (const item of order.items) {
                await Inventory.findOneAndUpdate(
                    { sku: item.sku, batchId: item.batchId },
                    { $inc: { stock: item.quantity } }
                );
            }
        }

        order.status = 'Cancelled';
        await order.save();

        return NextResponse.json({ success: true, message: "Order cancelled and inventory restocked" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
