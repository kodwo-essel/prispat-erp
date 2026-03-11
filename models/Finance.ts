import mongoose from "mongoose";

const FinanceSchema = new mongoose.Schema(
    {
        txId: {
            type: String,
            required: true,
            unique: true,
        },
        entity: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["Revenue", "Expense", "A/R", "Payroll", "Tax"],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ["Settled", "Pending", "Overdue", "Cancelled"],
            default: "Pending",
        },
        category: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        recordedBy: {
            type: String, // Employee name or ID
            required: true,
        },
        auditTrail: [
            {
                action: String,
                by: String,
                time: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Finance || mongoose.model("Finance", FinanceSchema);
