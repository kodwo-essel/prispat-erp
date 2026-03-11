const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env.local");
    process.exit(1);
}

// Define inline schemas for seeding to avoid TS/Next.js module issues in a plain script
const InventorySchema = new mongoose.Schema({
    name: String, sku: String, category: String, stock: Number, unit: String,
    hazardClass: String, batchId: String, expiryDate: Date, status: String, supplier: String
});

const FinanceSchema = new mongoose.Schema({
    txId: String, entity: String, type: String, amount: Number, date: Date,
    status: String, category: String, recordedBy: String
});

const SupplierSchema = new mongoose.Schema({
    name: String, contactPerson: String, email: String, phone: String,
    category: String, status: String, location: String
});

const CustomerSchema = new mongoose.Schema({
    name: String, region: String, contact: String, creditLimit: Number, status: String
});

const StaffSchema = new mongoose.Schema({
    name: String, staffId: String, role: String, department: String,
    accessLevel: String, status: String, credentials: { email: String }
});

const Inventory = mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema);
const Finance = mongoose.models.Finance || mongoose.model("Finance", FinanceSchema);
const Supplier = mongoose.models.Supplier || mongoose.model("Supplier", SupplierSchema);
const Customer = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
const Staff = mongoose.models.Staff || mongoose.model("Staff", StaffSchema);

const seedData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for seeding...");

        // Clear existing data
        await Inventory.deleteMany({});
        await Finance.deleteMany({});
        await Supplier.deleteMany({});
        await Customer.deleteMany({});
        await Staff.deleteMany({});

        console.log("Cleared existing records.");

        // Seed Suppliers
        await Supplier.insertMany([
            { name: "AgroGen Hub", contactPerson: "Sarah Mensah", email: "smensah@agrogen.com", phone: "+233 24 555 0102", category: "Biotech", status: "Active", location: "Accra Central" },
            { name: "TerraChem Ltd", contactPerson: "Kofi Annan", email: "kannan@terrachem.gh", phone: "+233 20 111 2222", category: "Agrochemicals", status: "Active", location: "Kumasi Industrial Area" }
        ]);

        // Seed Inventory
        await Inventory.insertMany([
            { name: "Glyphosate 480SL", sku: "HERB-GLY-480-112", category: "Herbicide", stock: 1240, unit: "Liters", hazardClass: "Level 2", batchId: "B-91022", expiryDate: new Date("2028-12-01"), status: "In Stock", supplier: "AgroGen Hub" },
            { name: "NPK 15-15-15", sku: "FERT-NPK-001-99", category: "Fertilizer", stock: 450, unit: "Bags (50kg)", hazardClass: "Non-Hazardous", batchId: "B-44101", expiryDate: new Date("2027-06-15"), status: "Low Inventory", supplier: "TerraChem Ltd" }
        ]);

        // Seed Finance
        await Finance.insertMany([
            { txId: "TX-9001", entity: "Green Valley Co-op", type: "Revenue", amount: 4250, date: new Date(), status: "Settled", category: "Input Sales", recordedBy: "Officer James Doe" },
            { txId: "TX-9002", entity: "AgroGen Hub", type: "Expense", amount: 12400, date: new Date(Date.now() - 86400000), status: "Pending", category: "Procurement", recordedBy: "Officer James Doe" }
        ]);

        // Seed Customers
        await Customer.insertMany([
            { name: "Green Valley Co-operatives", region: "Western North", contact: "Samuel Tetteh", creditLimit: 50000, status: "Active" },
            { name: "Abokobi Farms", region: "Greater Accra", contact: "Mary Owusu", creditLimit: 25000, status: "Active" }
        ]);

        // Seed Staff
        await Staff.insertMany([
            { name: "Dr. James Mensah", staffId: "ST-001", role: "Regional Director", department: "Executive", accessLevel: "Root", status: "Active", credentials: { email: "j.mensah@prispat.gov" } },
            { name: "Sarah Boateng", staffId: "ST-002", role: "Inventory Lead", department: "Logistics", accessLevel: "Administrator", status: "Active", credentials: { email: "s.boateng@prispat.gov" } },
            { name: "Eric Quansah", staffId: "ST-003", role: "Finance Officer", department: "Accounts", accessLevel: "Administrator", status: "Active", credentials: { email: "e.quansah@prispat.gov" } }
        ]);

        console.log("Database seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedData();
