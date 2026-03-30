import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Supply from "@/models/Supply";

export async function GET() {
    try {
        await dbConnect();

        const supplies = await Supply.aggregate([
            { $sort: { arrivalDate: -1 } },
            {
                $lookup: {
                    from: "finances",
                    localField: "invoiceId",
                    foreignField: "txId",
                    as: "financeData"
                }
            },
            {
                $addFields: {
                    financeRecord: { $arrayElemAt: ["$financeData", 0] }
                }
            },
            {
                $lookup: {
                    from: "finances",
                    localField: "invoiceId",
                    foreignField: "parentInvoiceId",
                    pipeline: [{ $match: { status: "Settled" } }],
                    as: "childPayments"
                }
            },
            {
                $addFields: {
                    "financeRecord.status": {
                        $cond: {
                            if: { $gt: [{ $size: "$childPayments" }, 0] },
                            then: {
                                $cond: {
                                    if: { $gte: [{ $sum: "$childPayments.amount" }, "$financeRecord.amount"] },
                                    then: "Settled",
                                    else: "Partial"
                                }
                            },
                            else: { $ifNull: ["$financeRecord.status", "Unpaid"] }
                        }
                    }
                }
            },
            { $project: { financeData: 0, childPayments: 0 } }
        ]);

        return NextResponse.json({ success: true, data: supplies });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
