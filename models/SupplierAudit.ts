import mongoose from "mongoose";

const SupplierAuditSchema = new mongoose.Schema(
    {
        auditId: {
            type: String,
            required: true,
            unique: true,
        },
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: ["Annual Structural", "Random Quality Check", "New Batch Validation", "Compliance Review"],
        },
        date: {
            type: Date,
            default: Date.now,
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        status: {
            type: String,
            required: true,
            enum: ["Pass", "Conditional", "Fail"],
        },
        notes: {
            type: String,
        },
        conductedBy: {
            type: String, // Staff ID or Name
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.SupplierAudit || mongoose.model("SupplierAudit", SupplierAuditSchema);
