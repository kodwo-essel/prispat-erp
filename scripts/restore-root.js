const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

async function restoreRoot() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to database...");

        // Define Staff Schema locally to avoid model issues
        const Staff = mongoose.models.Staff || mongoose.model("Staff", new mongoose.Schema({
            name: String,
            staffId: { type: String, unique: true },
            role: String,
            department: String,
            phone: String,
            accessLevel: String,
            status: String,
            credentials: {
                email: { type: String, unique: true },
                password: { type: String }
            }
        }));

        const rootId = "ST-001";
        const password = "Admin@123";
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const rootData = {
            name: "Dr. James Mensah",
            staffId: rootId,
            role: "Regional Director",
            department: "Executive",
            phone: "+233 24 555 0101",
            accessLevel: "Root",
            status: "Active",
            credentials: {
                email: "j.mensah@prispat.gov",
                password: hashedPassword
            }
        };

        const result = await Staff.findOneAndUpdate(
            { staffId: rootId },
            { $set: rootData },
            { upsert: true, new: true }
        );

        console.log("ROOT ACCOUNT RESTORED SUCCESSFULLY.");
        console.log("Staff ID: ST-001");
        console.log("Access Level: Root");
        console.log("Password: " + password);

        process.exit(0);
    } catch (error) {
        console.error("FAILED TO RESTORE ROOT:", error);
        process.exit(1);
    }
}

restoreRoot();
