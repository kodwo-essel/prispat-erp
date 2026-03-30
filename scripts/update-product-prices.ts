/**
 * Update Product Prices: Sunphosate 1L and King Kong
 * ---------------------------------------------------
 * Updates the unitPrice from 38 to 37.5 for "Sunphosate 1L" and "King Kong".
 * Also updates all existing Order and Finance records that used the old price.
 * 
 * Run: npx tsx scripts/update-product-prices.ts
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Inventory from "../models/Inventory";
import Order from "../models/Order";
import Finance from "../models/Finance";

dotenv.config({ path: ".env.local" });

async function run() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI not set in .env.local");

    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB.\n");

    const productNames = ["Sunphosate 1L", "King Kong", "King Kong 1L"];
    const oldPrice = 38;
    const newPrice = 37.5;

    // 1. Update Inventory
    console.log(`Updating Inventory for ${productNames.join(", ")}...`);
    const inventoryResult = await Inventory.updateMany(
        { name: { $in: productNames.map(name => new RegExp(`^${name}$`, "i")) } },
        { unitPrice: newPrice }
    );
    console.log(`✅ Updated ${inventoryResult.modifiedCount} inventory items.\n`);

    // 2. Update Orders
    console.log(`Searching for Orders with ${productNames.join(", ")} at price ${newPrice} (already updated) or ${oldPrice}...`);
    const orders = await Order.find({
        "items.name": { $in: productNames.map(name => new RegExp(`^${name}$`, "i")) },
        "items.unitPrice": { $in: [oldPrice, newPrice] }
    });

    console.log(`Found ${orders.length} orders to update.`);

    for (const order of orders) {
        let orderUpdated = false;

        for (const item of order.items) {
            const isMatch = productNames.some(name => new RegExp(`^${name}$`, "i").test(item.name));
            if (isMatch && item.unitPrice === oldPrice) {
                console.log(`  Updating Order ${order.orderId}: Item "${item.name}" price ${oldPrice} -> ${newPrice}`);
                item.unitPrice = newPrice;
                item.total = item.quantity * newPrice;
                orderUpdated = true;
            }
        }

        if (orderUpdated) {
            // Recalculate totalAmount
            const oldTotalAmount = order.totalAmount;
            order.totalAmount = order.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
            await order.save();
            console.log(`  ✅ Saved Order ${order.orderId}. Total Amount: ${oldTotalAmount} -> ${order.totalAmount}`);
        }

        // Always check Finance Records for these orders to ensure they match order.totalAmount
        const currentTotalAmount = order.totalAmount;
        const financeRecords = await Finance.find({
            $or: [
                { orderId: order.orderId },
                { txId: order.txId },
                { parentInvoiceId: order.txId },
                { txId: `INV-${order.orderId.split("-")[1]}` },
                { parentInvoiceId: `INV-${order.orderId.split("-")[1]}` }
            ],
            type: "Revenue"
        });

        for (const fin of financeRecords) {
            // Update amount if it matches the current order total (or if it needs fixing)
            if (fin.amount !== currentTotalAmount) {
                console.log(`    Updating Finance ${fin.txId}: Amount ${fin.amount} -> ${currentTotalAmount}`);
                fin.amount = currentTotalAmount;
                await fin.save();
                console.log(`    ✅ Saved Finance ${fin.txId}`);
            }
        }

        // After all related finance records are updated, sync the Invoice record status and totalPaid
        const invoice = financeRecords.find(f => f.isInvoice && (f.txId === order.txId || f.txId === `INV-${order.orderId.split("-")[1]}`));
        if (invoice) {
            const payments = financeRecords.filter(f => !f.isInvoice && f.parentInvoiceId === invoice.txId);
            const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

            let status = invoice.status;
            if (status !== "Cancelled") {
                if (totalPaid >= invoice.amount) status = "Settled";
                else if (totalPaid > 0) status = "Partial";
                else status = "Pending";
            }

            if (invoice.totalPaid !== totalPaid || invoice.status !== status) {
                console.log(`    Syncing Invoice ${invoice.txId}: totalPaid ${invoice.totalPaid} -> ${totalPaid}, status ${invoice.status} -> ${status}`);
                invoice.totalPaid = totalPaid;
                invoice.status = status;
                await invoice.save();
                console.log(`    ✅ Synced Invoice ${invoice.txId}`);
            }
        }
    }

    console.log("\n✨ Price update completed successfully.");
    await mongoose.disconnect();
}

run().catch((err) => {
    console.error("❌ Update failed:", err);
    process.exit(1);
});
