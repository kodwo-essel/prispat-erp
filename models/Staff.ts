import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        staffId: {
            type: String,
            required: true,
            unique: true,
        },
        role: {
            type: String,
            required: true,
        },
        department: {
            type: String,
            required: true,
        },
        accessLevel: {
            type: String,
            enum: ["Root", "Administrator", "Officer", "Technical"],
            required: true,
        },
        status: {
            type: String,
            enum: ["Active", "Suspended", "On Leave", "Terminated"],
            default: "Active",
        },
        credentials: {
            email: {
                type: String,
                required: true,
                unique: true,
            },
            password: {
                type: String,
                required: true,
                select: false, // Don't return password by default
            },
        },
        auditLogs: [
            {
                action: String,
                timestamp: { type: Date, default: Date.now },
                ip: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Staff || mongoose.model("Staff", StaffSchema);
