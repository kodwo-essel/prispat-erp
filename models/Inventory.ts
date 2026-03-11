import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema(
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
        stock: {
            type: Number,
            required: [true, "Please provide the stock quantity"],
            default: 0,
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
        status: {
            type: String,
            enum: ["In Stock", "Out of Stock", "Low Inventory", "Decommissioned"],
            default: "In Stock",
        },
        supplier: {
            type: String, // Can be refined to a Reference later
            required: [true, "Please provide the supplier name"],
        },
        unitPrice: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate entries for the same product in the same batch
InventorySchema.index({ sku: 1, batchId: 1 }, { unique: true });

export default mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema);
