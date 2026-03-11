import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        region: {
            type: String,
            required: true,
        },
        contact: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        creditLimit: {
            type: Number,
            required: true,
        },
        creditUsage: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["Active", "On Hold", "Restricted"],
            default: "Active",
        },
        balance: {
            type: Number,
            default: 0,
        },
        interactions: [
            {
                date: { type: Date, default: Date.now },
                note: String,
                officer: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
