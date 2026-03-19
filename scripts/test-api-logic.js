
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function testApiLogic() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);

        const Finance = mongoose.connection.collection('finances');

        // Emulate the aggregation pipeline from app/api/finance/invoices/route.ts
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
        ]).toArray();

        console.log(`API check: Found ${invoices.length} invoices`);
        invoices.forEach(inv => {
            console.log(`ID: ${inv.txId}, Status: ${inv.status}, Amount: ${inv.amount}, Paid: ${inv.totalPaid}`);
        });

        const outstanding = invoices.filter(inv =>
            inv.status !== "Settled" && inv.status !== "Cancelled"
        );
        console.log(`Frontend check: Found ${outstanding.length} outstanding invoices`);
        outstanding.forEach(inv => {
            console.log(`OUTSTANDING -> ID: ${inv.txId}, Status: ${inv.status}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

testApiLogic();
