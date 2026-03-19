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
    staffId: String,
    role: String
});

const Staff = mongoose.models.Staff || mongoose.model("Staff", StaffSchema);

const deleteStaff = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for deletion...");

        const namesToDelete = ["Abubakar Salifu", "Aisha Kone"];

        const result = await Staff.deleteMany({ name: { $in: namesToDelete } });

        console.log(`Successfully decommissioned ${result.deletedCount} staff records.`);

        if (result.deletedCount < namesToDelete.length) {
            console.warn(`Warning: Only ${result.deletedCount} out of ${namesToDelete.length} records were found and deleted.`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error deleting staff:", error);
        process.exit(1);
    }
};

deleteStaff();
