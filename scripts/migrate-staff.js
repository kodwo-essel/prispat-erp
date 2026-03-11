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
    role: String,
    department: String,
    phone: String,
    credentials: {
        email: String
    }
}, { timestamps: true });

const Staff = mongoose.models.Staff || mongoose.model("Staff", StaffSchema);

const migrateStaff = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for staff migration...");

        const personnel = await Staff.find({});
        console.log(`Found ${personnel.length} officers to update.`);

        for (const person of personnel) {
            let updated = false;

            if (!person.phone) {
                person.phone = "+233 20 " + Math.floor(1000000 + Math.random() * 9000000);
                updated = true;
            }

            if (updated) {
                await person.save();
                console.log(`Updated ${person.name} with phone: ${person.phone}`);
            }
        }

        console.log("Migration complete.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrateStaff();
