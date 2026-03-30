import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import dbConnect from "@/lib/dbConnect";
import Finance from "@/models/Finance";
import Inventory from "@/models/Inventory";

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.user, "VIEW_FINANCE")) {
            return NextResponse.json({ success: false, error: "ACCESS DENIED: UNAUTHORIZED." }, { status: 403 });
        }
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const parentInvoiceId = searchParams.get("parentInvoiceId");
        const txId = searchParams.get("txId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        // If fetching child payments for a specific invoice, return them directly
        if (parentInvoiceId) {
            const payments = await Finance.find({ parentInvoiceId }).sort({ date: 1 }).lean();
            return NextResponse.json({ success: true, data: payments });
        }

        // If fetching a specific record by txId
        if (txId) {
            const record = await Finance.findOne({ txId }).lean() as any;
            if (record) {
                const childPayments = await Finance.find({ parentInvoiceId: txId, status: "Settled" }).lean();
                record.totalPaid = childPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                return NextResponse.json({ success: true, data: [record] });
            }
            return NextResponse.json({ success: true, data: [] });
        }

        // Build Match Filter
        const matchFilter: any = { isInvoice: { $ne: true } };
        if (startDate || endDate) {
            matchFilter.date = {};
            if (startDate) matchFilter.date.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchFilter.date.$lte = end;
            }
        }

        // Define the aggregation pipeline to calculate totalPaid dynamically
        const transactions = await Finance.aggregate([
            {
                // Finance Ledger shows financial transactions:
                // - PAY-* records (payments linked to invoices — these ARE the transactions)
                // - TX-* records (standalone expenses, wages, etc.)
                // Exclude INV-* invoice documents — those belong in the Invoices section.
                $match: matchFilter
            },
            {
                // Join with payments (any record whose parentInvoiceId matches this txId)
                $lookup: {
                    from: "finances", // The name of the collection
                    localField: "txId",
                    foreignField: "parentInvoiceId",
                    pipeline: [
                        { $match: { status: "Settled" } }
                    ],
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
                    // Legacy settled records (no children) keep their stored status.
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
                    // Map calculated fields back to standard fields for frontend compatibility
                    _id: 1,
                    txId: 1,
                    orderId: 1,
                    entity: 1,
                    type: 1,
                    amount: 1,
                    date: 1,
                    // Use calculated values
                    status: "$calculatedStatus",
                    totalPaid: "$calculatedPaid",
                    isInvoice: 1,
                    parentInvoiceId: 1,
                    category: 1,
                    description: 1,
                    recordedBy: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            },
            { $sort: { date: -1 } }
        ]);

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
        const { items, status, type, parentInvoiceId, amount } = body;

        // Auto-generate transaction ID with correct prefix
        if (!body.txId) {
            const suffix = `${Date.now().toString().slice(-8)}`;
            if (body.parentInvoiceId) {
                // This is a payment record
                body.txId = `PAY-${suffix}`;
            } else if (body.isInvoice) {
                // This is an invoice
                body.txId = `INV-${suffix}`;
            } else {
                // Standalone finance transaction (expense, payroll, etc.)
                body.txId = `TX-${suffix}`;
            }
        }

        // Set recordedBy from authenticated session
        body.recordedBy = session.user.name || "System Automator";

        // 1. Inventory Deduction (Stock Reservation) for manual invoices
        if (items && items.length > 0 && (status === "Settled" || status === "Pending") && type === "Revenue") {
            // Only deduct if this is a new Invoice/Sale (not a payment for an old one)
            if (!parentInvoiceId) {
                const InventoryModel = (await import("@/models/Inventory")).default;
                for (const item of items) {
                    const invItem = await InventoryModel.findOne({ sku: item.sku, batchId: item.batchId });
                    if (!invItem || invItem.stock < item.quantity) {
                        return NextResponse.json({
                            success: false,
                            error: `Insufficient stock for ${item.name} (Batch: ${item.batchId}). Available: ${invItem?.stock || 0}`
                        }, { status: 400 });
                    }
                }

                for (const item of items) {
                    await InventoryModel.findOneAndUpdate(
                        { sku: item.sku, batchId: item.batchId },
                        { $inc: { stock: -item.quantity } }
                    );
                }
            }
        }

        const transaction = await Finance.create(body);

        // 2. Update parent invoice status if this is a payment
        if (body.parentInvoiceId && status === "Settled") {
            const parent = await Finance.findOne({ txId: body.parentInvoiceId });
            if (parent) {
                const childPayments = await Finance.find({
                    parentInvoiceId: body.parentInvoiceId,
                    status: "Settled"
                });
                const totalPaid = childPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

                let newStatus = parent.status;
                if (totalPaid >= parent.amount) {
                    newStatus = "Settled";
                } else if (totalPaid > 0) {
                    newStatus = "Partial";
                }

                if (newStatus !== parent.status) {
                    await Finance.updateOne(
                        { txId: body.parentInvoiceId },
                        { $set: { status: newStatus } }
                    );
                }
            }
        }

        return NextResponse.json({ success: true, data: transaction }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
