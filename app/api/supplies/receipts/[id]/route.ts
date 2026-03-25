import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SupplyReceipt from "@/models/SupplyReceipt";
import Supply from "@/models/Supply";
import Inventory from "@/models/Inventory";
import Finance from "@/models/Finance";

export const dynamic = "force-dynamic";

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

        let financeRecord = null;
        if (receipt.invoiceId) {
            // Strategy 1: Standard Mongoose Lookup
            financeRecord = await Finance.findOne({ txId: String(receipt.invoiceId).trim() });

            // Strategy 2: Direct Collection Fallback (Bypassing Model Cache)
            if (!financeRecord) {
                const db = (await dbConnect()).connection.db;
                if (db) {
                    financeRecord = await db.collection('finances').findOne({ txId: String(receipt.invoiceId).trim() });
                }
            }
        }

        // Strategy 3: Receipt Number Fallback (Double check)
        if (!financeRecord) {
            financeRecord = await Finance.findOne({
                $or: [
                    { txId: `EXP-REC-${receipt.receiptNumber}-MIGR` },
                    { txId: `EXP-REC-${receipt.receiptNumber}` }
                ]
            });
        }

        return NextResponse.json({ success: true, data: { ...receipt.toObject(), financeRecord } });
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
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        const { arrivalDate } = body;

        if (!arrivalDate) {
            return NextResponse.json({ success: false, error: "Arrival date is required" }, { status: 400 });
        }

        const receipt = await SupplyReceipt.findById(id);
        if (!receipt) {
            return NextResponse.json({ success: false, error: "Receipt not found" }, { status: 404 });
        }

        const oldArrivalDate = receipt.arrivalDate;

        // 1. Update Supply records associated with this receipt
        // A receipt item matches a Supply record by sku, batchId, supplier and the OLD arrivalDate
        for (const item of receipt.items) {
            await Supply.updateMany(
                {
                    sku: item.sku,
                    batchId: item.batchId,
                    supplier: receipt.supplier,
                    arrivalDate: oldArrivalDate
                },
                { $set: { arrivalDate: new Date(arrivalDate) } }
            );
        }

        // 2. Update the Receipt itself
        receipt.arrivalDate = new Date(arrivalDate);
        await receipt.save();

        return NextResponse.json({ success: true, data: receipt });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
