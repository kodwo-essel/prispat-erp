const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env.local");
    process.exit(1);
}

const CustomerSchema = new mongoose.Schema({
    name: String,
    region: String,
    contact: String,
    email: String,
    phone: String,
    status: String
}, { timestamps: true });

const Customer = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);

const migrateCustomers = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for customer migration...");

        const customers = await Customer.find({});
        console.log(`Found ${customers.length} customers to update.`);

        for (const customer of customers) {
            let updated = false;
            if (!customer.email) {
                customer.email = `${customer.name.toLowerCase().replace(/\s+/g, '.')}@prispat.com`;
                updated = true;
            }
            if (!customer.phone) {
                customer.phone = "+233 24 " + Math.floor(1000000 + Math.random() * 9000000);
                updated = true;
            }

            if (updated) {
                await customer.save();
                console.log(`Updated ${customer.name} with email: ${customer.email} and phone: ${customer.phone}`);
            }
        }

        console.log("Migration complete.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrateCustomers();
