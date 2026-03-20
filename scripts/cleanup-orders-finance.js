const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env.local");
    process.exit(1);
}

// Minimal Schemas
const OrderSchema = new mongoose.Schema({
    orderId: String,
    txId: String
}, { timestamps: true });

const FinanceSchema = new mongoose.Schema({
    txId: String,
    orderId: String,
    parentInvoiceId: String
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
const Finance = mongoose.models.Finance || mongoose.model("Finance", FinanceSchema);

const cleanupRecords = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for record deletion...");

        const orderIds = ["ORD-1773912063988", "ORD-1773911941681"];
        const invoiceIds = ["INV-1773912063917", "INV-1773911941610"];

        console.log(`Attempting to delete orders: ${orderIds.join(", ")}`);
        console.log(`Attempting to delete invoices/records: ${invoiceIds.join(", ")}`);

        // Delete from Order collection
        const orderResult = await Order.deleteMany({ orderId: { $in: orderIds } });
        console.log(`Successfully deleted ${orderResult.deletedCount} orders.`);

        // Delete from Finance collection
        const financeResult = await Finance.deleteMany({
            $or: [
                { orderId: { $in: orderIds } },
                { txId: { $in: invoiceIds } },
                { parentInvoiceId: { $in: invoiceIds } }
            ]
        });
        console.log(`Successfully deleted ${financeResult.deletedCount} finance records.`);

        process.exit(0);
    } catch (error) {
        console.error("Deletion failed:", error);
        process.exit(1);
    }
};

cleanupRecords();
