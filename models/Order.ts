import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true,
        },
        customer: {
            id: String,
            name: String,
            phone: String,
        },
        saleType: {
            type: String,
            enum: ["Credit", "Cash"],
            default: "Credit",
        },
        items: [
            {
                sku: String,
                name: String,
                batchId: String,
                quantity: Number,
                unitPrice: Number,
                total: Number,
            }
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Dispatched", "Delivered", "Cancelled", "Received"],
            default: "Pending",
        },
        dispatchDate: {
            type: Date,
        },
        txId: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
