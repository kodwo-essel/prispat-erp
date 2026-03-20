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
    orderId: String
}, { timestamps: true });

const FinanceSchema = new mongoose.Schema({
    txId: String,
    orderId: String,
    parentInvoiceId: String
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
const Finance = mongoose.models.Finance || mongoose.model("Finance", FinanceSchema);

const verifyCleanup = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for verification...");

        const orderIds = ["ORD-1773912063988", "ORD-1773911941681"];
        const invoiceIds = ["INV-1773912063917", "INV-1773911941610"];

        const remainingOrders = await Order.find({ orderId: { $in: orderIds } });
        const remainingFinance = await Finance.find({
            $or: [
                { orderId: { $in: orderIds } },
                { txId: { $in: invoiceIds } },
                { parentInvoiceId: { $in: invoiceIds } }
            ]
        });

        console.log(`Remaining orders: ${remainingOrders.length}`);
        console.log(`Remaining finance records: ${remainingFinance.length}`);

        if (remainingOrders.length === 0 && remainingFinance.length === 0) {
            console.log("Verification SUCCESS: All specified records have been removed.");
        } else {
            console.error("Verification FAILED: Some records still exist.");
            if (remainingOrders.length > 0) console.log("Orders:", remainingOrders.map(o => o.orderId));
            if (remainingFinance.length > 0) console.log("Finance:", remainingFinance.map(f => f.txId || f.orderId));
        }

        process.exit(0);
    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
};

verifyCleanup();
