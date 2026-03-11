import mongoose from "mongoose";

const SupplySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide the item name"],
        },
        sku: {
            type: String,
            required: [true, "Please provide a unique SKU"],
        },
        category: {
            type: String,
            required: [true, "Please provide a category"],
        },
        quantity: {
            type: Number,
            required: [true, "Please provide the received quantity"],
        },
        unit: {
            type: String,
            required: [true, "Please provide the unit of measurement"],
        },
        hazardClass: {
            type: String,
            required: [true, "Please provide the hazard classification"],
        },
        batchId: {
            type: String,
            required: [true, "Please provide the batch ID"],
        },
        expiryDate: {
            type: Date,
            required: [true, "Please provide the expiry date"],
        },
        supplier: {
            type: String,
            required: true,
        },
        unitPrice: {
            type: Number,
            default: 0,
        },
        arrivalDate: {
            type: Date,
            default: Date.now,
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Supply || mongoose.model("Supply", SupplySchema);
