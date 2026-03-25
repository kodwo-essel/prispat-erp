import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Inventory from "@/models/Inventory";
import Supply from "@/models/Supply";
import Finance from "@/models/Finance";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const item = await Inventory.findById(id);

        if (!item) {
            return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
        }

        // Find the original supply record to get the invoiceId
        const supply = await Supply.findOne({ sku: item.sku, batchId: item.batchId });

        let financeRecord = null;
        if (supply && supply.invoiceId) {
            financeRecord = await Finance.findOne({ txId: supply.invoiceId });
        }

        return NextResponse.json({ success: true, data: { ...item.toObject(), invoiceId: supply?.invoiceId, financeRecord } });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const item = await Inventory.findByIdAndUpdate(id, body, { new: true });

        if (!item) {
            return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: item });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const item = await Inventory.findByIdAndDelete(id);

        if (!item) {
            return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: { message: "Item deleted" } });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
