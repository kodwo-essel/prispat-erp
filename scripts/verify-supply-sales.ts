import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MONGODB_URI not found");
    process.exit(1);
}

// Define Schemas (simplified for verification)
const ReceiptItemSchema = new mongoose.Schema({
    name: String,
    sku: String,
    quantity: Number,
    unitPrice: Number,
    supplierPrice: Number,
    batchId: String,
});

const SupplyReceiptSchema = new mongoose.Schema({
    receiptNumber: String,
    items: [ReceiptItemSchema],
});

const InventorySchema = new mongoose.Schema({
    sku: String,
    batchId: String,
    stock: Number,
});

const SupplyReceipt = mongoose.models.SupplyReceipt || mongoose.model("SupplyReceipt", SupplyReceiptSchema);
const Inventory = mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema);

async function verify() {
    await mongoose.connect(MONGODB_URI!);
    console.log("Connected to MongoDB");

    const receipt = await SupplyReceipt.findOne({ "items.0": { $exists: true } });
    if (!receipt) {
        console.log("No supply receipts found with items.");
        process.exit(0);
    }

    console.log(`Verifying Receipt: ${receipt.receiptNumber}`);

    for (const item of receipt.items) {
        const inv = await Inventory.findOne({ sku: item.sku, batchId: item.batchId });
        const currentStock = inv ? inv.stock : 0;
        const quantityReceived = item.quantity;
        const quantitySold = Math.max(0, quantityReceived - currentStock);
        const amountSold = quantitySold * (item.unitPrice || 0);

        console.log(`--- Item: ${item.name} (${item.sku}) ---`);
        console.log(`Batch: ${item.batchId}`);
        console.log(`Received: ${quantityReceived}`);
        console.log(`Stock: ${currentStock}`);
        console.log(`Sold: ${quantitySold}`);
        console.log(`Selling Price: ${item.unitPrice}`);
        console.log(`Amount Sold: ₵${amountSold.toLocaleString()}`);
    }

    await mongoose.disconnect();
}

verify().catch(console.error);
