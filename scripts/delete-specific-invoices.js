const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env.local");
    process.exit(1);
}

// Minimal Schema
const FinanceSchema = new mongoose.Schema({
    txId: String
}, { timestamps: true });

const Finance = mongoose.models.Finance || mongoose.model("Finance", FinanceSchema);

const deleteSpecificInvoices = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for record deletion...");

        const txIdsToDelete = [
            "INV-971487"
        ];

        const result = await Finance.deleteMany({ txId: { $in: txIdsToDelete } });
        console.log(`Successfully deleted ${result.deletedCount} records.`);

        process.exit(0);
    } catch (error) {
        console.error("Deletion failed:", error);
        process.exit(1);
    }
};

deleteSpecificInvoices();
