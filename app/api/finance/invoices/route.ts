import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import dbConnect from "@/lib/dbConnect";
import Finance from "@/models/Finance";

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.user, "VIEW_FINANCE")) {
            return NextResponse.json({ success: false, error: "ACCESS DENIED: UNAUTHORIZED." }, { status: 403 });
        }
        await dbConnect();

        // Return all invoice records with dynamically calculated totalPaid
        const invoices = await Finance.aggregate([
            { $match: { isInvoice: true } },
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
                    calculatedPaid: {
                        $cond: {
                            if: { $gt: [{ $size: "$childPayments" }, 0] },
                            then: { $sum: "$childPayments.amount" },
                            else: { $ifNull: ["$totalPaid", 0] }
                        }
                    },
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
                            else: "$status"
                        }
                    }
                }
            },
            {
                $project: {
                    childPayments: 0
                }
            },
            {
                $addFields: {
                    status: "$calculatedStatus",
                    totalPaid: "$calculatedPaid"
                }
            },
            { $sort: { date: -1 } }
        ]);

        return NextResponse.json({ success: true, data: invoices });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
