import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import dbConnect from "@/lib/dbConnect";
import Finance from "@/models/Finance";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.user, "VIEW_FINANCE")) {
            return NextResponse.json({ success: false, error: "ACCESS DENIED: UNAUTHORIZED." }, { status: 403 });
        }

        await dbConnect();
        const { id } = await params;

        // Build match condition: support both _id and txId
        const matchCondition: any = mongoose.isValidObjectId(id)
            ? { $or: [{ _id: new mongoose.Types.ObjectId(id) }, { txId: id }] }
            : { txId: id };

        const results = await Finance.aggregate([
            { $match: matchCondition },
            {
                $lookup: {
                    from: "finances",
                    localField: "txId",
                    foreignField: "parentInvoiceId",
                    pipeline: [{ $match: { status: "Settled" } }],
                    as: "childPayments"
                }
            },
            {
                $addFields: {
                    // If child payment records exist, sum them. Otherwise use the stored snapshot.
                    calculatedPaid: {
                        $cond: {
                            if: { $gt: [{ $size: "$childPayments" }, 0] },
                            then: { $sum: "$childPayments.amount" },
                            else: { $ifNull: ["$totalPaid", 0] }
                        }
                    },
                    // Only recalculate status from payments when real child payment records exist.
                    calculatedStatus: {
                        $cond: {
                            if: {
                                $and: [
                                    { $eq: ["$isInvoice", true] },
                                    { $gt: [{ $size: "$childPayments" }, 0] }
                                ]
                            },
                            then: {
                                $switch: {
                                    branches: [
                                        { case: { $eq: ["$status", "Cancelled"] }, then: "Cancelled" },
                                        { case: { $gte: [{ $sum: "$childPayments.amount" }, "$amount"] }, then: "Settled" },
                                        { case: { $gt: [{ $sum: "$childPayments.amount" }, 0] }, then: "Partial" }
                                    ],
                                    default: "Pending"
                                }
                            },
                            else: { $ifNull: ["$status", "Pending"] }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1, txId: 1, orderId: 1, entity: 1, type: 1, amount: 1,
                    date: 1, category: 1, description: 1, recordedBy: 1,
                    isInvoice: 1, parentInvoiceId: 1, paymentLog: 1, auditTrail: 1,
                    createdAt: 1, updatedAt: 1,
                    status: "$calculatedStatus",
                    totalPaid: "$calculatedPaid"
                }
            }
        ]);

        const transaction = results[0];

        if (!transaction) {
            return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: transaction });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.user, "MANAGE_FINANCE")) {
            return NextResponse.json({ success: false, error: "ACCESS DENIED" }, { status: 403 });
        }

        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        // 1. Fetch current transaction to check for linked order
        const currentTx = await Finance.findOne({
            $or: [
                { _id: mongoose.isValidObjectId(id) ? id : new mongoose.Types.ObjectId().toString() },
                { txId: id }
            ]
        });
        if (!currentTx) {
            return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
        }

        // 2. Handle Cancellation Sync (Inventory Restoration)
        if (body.status === "Cancelled" && currentTx.status !== "Cancelled") {
            const Order = (await import("@/models/Order")).default;
            const Inventory = (await import("@/models/Inventory")).default;

            // Find by orderId field (if exists) or fallback to txId in Orders
            const linkedOrder = await Order.findOne({
                $or: [{ orderId: currentTx.orderId }, { txId: currentTx.txId }]
            });

            if (linkedOrder && linkedOrder.status !== "Cancelled") {
                // Restock items
                for (const item of linkedOrder.items) {
                    await Inventory.findOneAndUpdate(
                        { sku: item.sku, batchId: item.batchId },
                        { $inc: { stock: item.quantity } }
                    );
                }
                linkedOrder.status = "Cancelled";
                await linkedOrder.save();
            }
        }

        const updated = await Finance.findOneAndUpdate(
            {
                $or: [
                    { _id: mongoose.isValidObjectId(id) ? id : new mongoose.Types.ObjectId().toString() },
                    { txId: id }
                ]
            },
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.user, "MANAGE_FINANCE")) {
            return NextResponse.json({ success: false, error: "ACCESS DENIED" }, { status: 403 });
        }

        await dbConnect();
        const { id } = await params;

        const deleted = await Finance.findOneAndDelete({
            $or: [
                { _id: mongoose.isValidObjectId(id) ? id : new mongoose.Types.ObjectId().toString() },
                { txId: id }
            ]
        });

        if (!deleted) {
            return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: deleted });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
