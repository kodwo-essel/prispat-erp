const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env.local");
    process.exit(1);
}

// Minimal Schemas for Migration
const OrderSchema = new mongoose.Schema({
    orderId: String,
    customer: { name: String },
    totalAmount: Number,
    txId: String,
    status: String,
    createdAt: Date
}, { timestamps: true });

const FinanceSchema = new mongoose.Schema({
    txId: String,
    orderId: String,
    entity: String,
    amount: Number,
    type: String,
    status: String,
    isInvoice: Boolean,
    totalPaid: Number,
    date: Date
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
const Finance = mongoose.models.Finance || mongoose.model("Finance", FinanceSchema);

const linkLegacyRecords = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for record linking...");

        const orders = await Order.find({ txId: { $exists: false } });
        const finances = await Finance.find({ orderId: { $exists: false } });

        console.log(`Analyzing ${orders.length} unlinked orders and ${finances.length} unlinked ledger entries.`);

        let matchCount = 0;

        for (const order of orders) {
            // Get numeric part
            const ordNum = parseInt(order.orderId.replace("ORD-", ""));

            // Try to find a finance record with matching prefix, amount and entity
            const match = finances.find(f => {
                const fId = f.txId.replace("TX-", "").replace("INV-", "");
                const fNum = parseInt(fId);

                // IDs usually created within seconds of each other
                const idProximity = Math.abs(ordNum - fNum) < 1000;
                const amountMatch = Math.abs(f.amount - order.totalAmount) < 0.01;
                const entityMatch = f.entity.toLowerCase().includes(order.customer.name.toLowerCase()) ||
                    order.customer.name.toLowerCase().includes(f.entity.toLowerCase());

                return idProximity && amountMatch && entityMatch;
            });

            if (match) {
                // Link them
                order.txId = match.txId;
                match.orderId = order.orderId;
                match.isInvoice = true; // Retroactively mark as invoice

                // If it was settled, ensure totalPaid is set
                if (match.status === "Settled" && (!match.totalPaid || match.totalPaid === 0)) {
                    match.totalPaid = match.amount;
                }

                await order.save();
                await match.save();

                console.log(`Linked ${order.orderId} <---> ${match.txId} (₵${match.amount})`);
                matchCount++;
            }
        }

        console.log(`\nLinkage Complete. Successfully cross-referenced ${matchCount} record pairs.`);
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

linkLegacyRecords();
