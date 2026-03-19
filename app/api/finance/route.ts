import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import dbConnect from "@/lib/dbConnect";
import Finance from "@/models/Finance";
import Inventory from "@/models/Inventory";

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.user, "VIEW_FINANCE")) {
            return NextResponse.json({ success: false, error: "ACCESS DENIED: UNAUTHORIZED." }, { status: 403 });
        }
        await dbConnect();
        const transactions = await Finance.find({}).sort({ date: -1 });
        return NextResponse.json({ success: true, data: transactions });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.user, "MANAGE_FINANCE")) {
            return NextResponse.json({ success: false, error: "ACCESS DENIED: UNAUTHORIZED." }, { status: 403 });
        }
        await dbConnect();
        const body = await request.json();
        const { items, status, type } = body;

        // Auto-generate transaction ID if not provided
        if (!body.txId) {
            body.txId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        // 1. If items are provided and it's a settled revenue transaction, deduct from inventory
        if (items && items.length > 0 && status === "Settled" && type === "Revenue") {
            for (const item of items) {
                const invItem = await Inventory.findOne({ sku: item.sku, batchId: item.batchId });
                if (!invItem || invItem.stock < item.quantity) {
                    return NextResponse.json({
                        success: false,
                        error: `Insufficient stock for ${item.name} (Batch: ${item.batchId}). Available: ${invItem?.stock || 0}`
                    }, { status: 400 });
                }
            }

            for (const item of items) {
                await Inventory.findOneAndUpdate(
                    { sku: item.sku, batchId: item.batchId },
                    { $inc: { stock: -item.quantity } }
                );
            }
        }

        const transaction = await Finance.create(body);
        return NextResponse.json({ success: true, data: transaction }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
