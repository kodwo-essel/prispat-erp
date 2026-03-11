const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env.local");
    process.exit(1);
}

const StaffSchema = new mongoose.Schema({
    name: String,
    staffId: { type: String, unique: true },
    role: String,
    department: String,
    accessLevel: String,
    status: { type: String, default: "Active" },
    credentials: {
        email: { type: String, unique: true },
        password: { type: String, default: "Admin@123" }
    }
});

const Staff = mongoose.models.Staff || mongoose.model("Staff", StaffSchema);

const addStaff = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for staff enrollment...");

        const newStaff = [
            {
                name: "Aisha Kone",
                staffId: "ST-004",
                role: "Quality Inspector",
                department: "Quality Control",
                accessLevel: "Officer",
                status: "Active",
                credentials: { email: "a.kone@prispat.gov" }
            },
            {
                name: "Abubakar Salifu",
                staffId: "ST-005",
                role: "Warehouse Officer",
                department: "Logistics",
                accessLevel: "Technical",
                status: "Active",
                credentials: { email: "a.salifu@prispat.gov" }
            }
        ];

        for (const s of newStaff) {
            const existing = await Staff.findOne({ staffId: s.staffId });
            if (!existing) {
                await Staff.create(s);
                console.log(`Enrolled: ${s.name} (${s.staffId})`);
            } else {
                console.log(`Staff ${s.staffId} already exists.`);
            }
        }

        console.log("Staff enrollment complete.");
        process.exit(0);
    } catch (error) {
        console.error("Error adding staff:", error);
        process.exit(1);
    }
};

addStaff();
