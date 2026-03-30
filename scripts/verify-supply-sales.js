const mongoose = require("mongoose");
const MONGODB_URI = "mongodb+srv://kodwoessel41:Y6WRBCDrlJOLFdej@cluster0.br3lvcu.mongodb.net/prispat_prime?appName=Cluster0";

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
    await mongoose.connect(MONGODB_URI);
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

    process.exit(0);
}

verify().catch(err => {
    console.error(err);
    process.exit(1);
});
