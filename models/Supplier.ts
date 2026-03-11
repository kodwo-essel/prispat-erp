import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        contactPerson: {
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
        category: {
            type: String,
            required: true,
        },
        reliability: {
            type: String, // "98%", etc (can be Number later)
            default: "100%",
        },
        status: {
            type: String,
            enum: ["Active", "Under Review", "Suspended"],
            default: "Active",
        },
        location: {
            type: String,
            required: true,
        },
        bankDetails: {
            bank: String,
            account: String,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Supplier || mongoose.model("Supplier", SupplierSchema);
