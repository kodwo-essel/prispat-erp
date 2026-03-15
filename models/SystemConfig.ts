import mongoose from "mongoose";

const SystemConfigSchema = new mongoose.Schema(
    {
        organizationName: { type: String, default: "Prispat Prime Distribution" },
        address: { type: String, default: "Plot 42, Industrial Area, Kumasi, Ghana" },
        email: { type: String, default: "admin@prispat.com" },
        phone: { type: String, default: "+233 24 000 0000" },
        logoUrl: { type: String, default: "" },
        systemNodeId: { type: String, default: "GH-ACCRA-CORE-01" },
        defaultCurrency: { type: String, default: "GHS" },
        timezone: { type: String, default: "GMT" },
        maintenanceMode: { type: Boolean, default: false },
        lastModifiedBy: String,
    },
    { timestamps: true }
);

export default mongoose.models.SystemConfig || mongoose.model("SystemConfig", SystemConfigSchema);
