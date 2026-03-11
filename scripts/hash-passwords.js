const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env.local");
    process.exit(1);
}

const StaffSchema = new mongoose.Schema({
    credentials: {
        password: { type: String, required: true }
    }
});

const Staff = mongoose.models.Staff || mongoose.model("Staff", StaffSchema);

const hashPasswords = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for security migration...");

        const staffList = await Staff.find({});
        console.log(`Found ${staffList.length} staff records to secure.`);

        for (const staff of staffList) {
            // Check if password looks like a hash (bcrypt hashes start with $2a$ or $2b$)
            if (!staff.credentials.password.startsWith("$2a$") && !staff.credentials.password.startsWith("$2b$")) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(staff.credentials.password || "Admin@123", salt);

                await Staff.updateOne(
                    { _id: staff._id },
                    { $set: { "credentials.password": hashedPassword } }
                );
                console.log(`Secured record: ${staff._id}`);
            } else {
                console.log(`Record ${staff._id} is already secured.`);
            }
        }

        console.log("Security migration complete.");
        process.exit(0);
    } catch (error) {
        console.error("Migration error:", error);
        process.exit(1);
    }
};

hashPasswords();
