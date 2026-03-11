import mongoose from "mongoose";

const SystemConfigSchema = new mongoose.Schema(
    {
        organizationName: { type: String, default: "Prispat Prime Distribution" },
        systemNodeId: { type: String, default: "GH-ACCRA-CORE-01" },
        defaultCurrency: { type: String, default: "GHS" },
        timezone: { type: String, default: "GMT" },
        maintenanceMode: { type: Boolean, default: false },
        lastModifiedBy: String,
    },
    { timestamps: true }
);

export default mongoose.models.SystemConfig || mongoose.model("SystemConfig", SystemConfigSchema);
