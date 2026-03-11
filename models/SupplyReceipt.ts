import mongoose from "mongoose";

const ReceiptItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    batchId: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    hazardClass: { type: String, default: "None" }
});

const SupplyReceiptSchema = new mongoose.Schema(
    {
        receiptNumber: {
            type: String,
            required: true,
            unique: true
        },
        supplier: {
            type: String,
            required: true
        },
        arrivalDate: {
            type: Date,
            default: Date.now
        },
        items: [ReceiptItemSchema],
        totalAmount: {
            type: Number,
            required: true,
            default: 0
        },
        notes: {
            type: String
        },
        status: {
            type: String,
            enum: ["Received", "Verified", "Disputed"],
            default: "Received"
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.SupplyReceipt || mongoose.model("SupplyReceipt", SupplyReceiptSchema);
