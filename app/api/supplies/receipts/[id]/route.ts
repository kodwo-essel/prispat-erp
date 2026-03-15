import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SupplyReceipt from "@/models/SupplyReceipt";
import Supply from "@/models/Supply";
import Inventory from "@/models/Inventory";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const receipt = await SupplyReceipt.findById(id);

        if (!receipt) {
            return NextResponse.json({ success: false, error: "Receipt not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: receipt });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const receipt = await SupplyReceipt.findById(id);

        if (!receipt) {
            return NextResponse.json({ success: false, error: "Receipt not found" }, { status: 404 });
        }

        // 1. Validate Stock Integrity
        for (const item of receipt.items) {
            const inventoryItem = await Inventory.findOne({
                sku: item.sku,
                batchId: item.batchId,
                supplier: receipt.supplier
            });

            if (!inventoryItem || inventoryItem.stock < item.quantity) {
                return NextResponse.json({
                    success: false,
                    error: `Cannot delete: ${item.name} stock (${inventoryItem?.stock || 0}) is less than the quantity in this receipt (${item.quantity}). Data integrity must be maintained.`
                }, { status: 400 });
            }
        }

        // 2. Revert Inventory and Delete Supply records
        for (const item of receipt.items) {
            await Inventory.findOneAndUpdate(
                { sku: item.sku, batchId: item.batchId, supplier: receipt.supplier },
                { $inc: { stock: -item.quantity } }
            );

            // Delete the corresponding supply audit log entry
            await Supply.deleteOne({
                sku: item.sku,
                batchId: item.batchId,
                arrivalDate: receipt.arrivalDate,
                supplier: receipt.supplier
            });
        }

        // 3. Delete the Receipt
        await SupplyReceipt.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: "Receipt and associated records reverted successfully." });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
