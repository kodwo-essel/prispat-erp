import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IStaff extends Document {
    name: string;
    staffId: string;
    role: string;
    department: string;
    phone: string;
    accessLevel: "Root" | "Administrator" | "Officer" | "Technical";
    status: "Active" | "Suspended" | "On Leave" | "Terminated";
    credentials: {
        email: string;
        password: string;
    };
    auditLogs: any[];
    comparePassword: (password: string) => Promise<boolean>;
}

const StaffSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        staffId: { type: String, required: true, unique: true },
        role: { type: String, required: true },
        department: { type: String, required: true },
        phone: { type: String, required: true },
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
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true, select: false },
        },
        auditLogs: [
            {
                action: String,
                timestamp: { type: Date, default: Date.now },
                ip: String,
                performedBy: String,
            },
        ],
    },
    { timestamps: true }
);

// Hash password before saving
StaffSchema.pre<IStaff>("save", async function () {
    if (!this.credentials || !this.isModified("credentials.password")) return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.credentials.password = await bcrypt.hash(this.credentials.password, salt);
    } catch (err: any) {
        throw err;
    }
});

// Method to compare passwords
StaffSchema.methods.comparePassword = async function (this: IStaff, password: string) {
    if (!this.credentials || !this.credentials.password) return false;
    return await bcrypt.compare(password, this.credentials.password);
};

const Staff: Model<IStaff> = mongoose.models.Staff || mongoose.model("Staff", StaffSchema);
export default Staff;
