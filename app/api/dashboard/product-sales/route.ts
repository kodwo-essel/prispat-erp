import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const startDateStr = searchParams.get("startDate");
        const endDateStr = searchParams.get("endDate");

        const now = new Date();
        const startDate = startDateStr ? new Date(startDateStr) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        let endDate = endDateStr ? new Date(endDateStr) : now;

        // If endDate is provided as a date string (YYYY-MM-DD), it defaults to 00:00:00.
        // We need to set it to 23:59:59 to include the full day.
        if (endDateStr) {
            endDate.setHours(23, 59, 59, 999);
        }

        // Aggregate orders to get items sold over time
        const salesData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: { $ne: "Cancelled" }
                }
            },
            { $unwind: "$items" },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        product: "$items.name"
                    },
                    quantity: { $sum: "$items.quantity" },
                    revenue: { $sum: "$items.total" }
                }
            },
            {
                $group: {
                    _id: "$_id.date",
                    products: {
                        $push: {
                            name: "$_id.product",
                            quantity: "$quantity",
                            revenue: "$revenue"
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Transform into a format easy for Recharts: [{ date: "2024-03-01", "Product A": 10, "Product B": 5, ... }]
        const formattedData = salesData.map(day => {
            const entry: any = { date: day._id };
            day.products.forEach((p: any) => {
                entry[p.name] = p.quantity;
            });
            return entry;
        });

        // Also get total sales per product for the whole period to identify top products
        const topProducts = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: { $ne: "Cancelled" }
                }
            },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.name",
                    totalQuantity: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: "$items.total" }
                }
            },
            { $sort: { totalQuantity: -1 } }
        ]);

        return NextResponse.json({
            success: true,
            data: {
                chartData: formattedData,
                topProducts: topProducts
            }
        });

    } catch (error: any) {
        console.error("Product Sales API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
