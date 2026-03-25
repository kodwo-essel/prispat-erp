/**
 * Audit: Sunphosate 1KG (Batch 20230406) Sales Check
 * ---------------------------------------------------
 * Checks all Order documents for any items with batchId "20230406"
 * to verify if 2 units were sold.
 *
 * Run: npx tsx scripts/audit-sunphosate-sales.ts
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const OrderSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

async function run() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI not set in .env.local");

    await mongoose.connect(uri);
    console.log("✅ Connected.\n");

    // Find all orders that contain an item with batchId "20230406"
    const orders = await Order.find({
        "items.batchId": "20230406"
    }).lean();

    if (orders.length === 0) {
        console.log("ℹ️  No orders found containing batch 20230406.");
        await mongoose.disconnect();
        return;
    }

    let totalSold = 0;

    for (const order of orders as any[]) {
        const matchingItems = order.items.filter((i: any) => i.batchId === "20230406");
        const qtyInOrder = matchingItems.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0);
        totalSold += qtyInOrder;

        console.log(`Order: ${order.orderId}`);
        console.log(`  Customer  : ${order.customer?.name ?? "N/A"}`);
        console.log(`  Status    : ${order.status}`);
        console.log(`  Sale Type : ${order.saleType}`);
        console.log(`  Date      : ${new Date(order.createdAt).toLocaleString("en-GB")}`);
        for (const item of matchingItems) {
            console.log(`  → ${item.name} | SKU: ${item.sku} | Batch: ${item.batchId} | Qty: ${item.quantity} | Unit Price: ₵${item.unitPrice}`);
        }
        console.log();
    }

    console.log(`─────────────────────────────────────`);
    console.log(`Total orders matched : ${orders.length}`);
    console.log(`Total units sold     : ${totalSold} Bag(s) of Sunphosate 1KG (Batch 20230406)`);
    await mongoose.disconnect();
}

run().catch((err) => {
    console.error("❌ Audit failed:", err);
    process.exit(1);
});
