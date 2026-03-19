
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Use the absolute path to the Finance model
// Since we are running this with node, we need to handle TS or just use the DB directly
// Let's just use the DB directly to be safe and avoid TS compilation issues in a quick script

async function checkInvoices() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error("MONGODB_URI not found");
            process.exit(1);
        }
        await mongoose.connect(uri);
        console.log("Connected to DB");

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));

        const Finance = mongoose.connection.collection('finances');
        const invoices = await Finance.find({ isInvoice: true }).toArray();
        console.log(`Found ${invoices.length} invoices`);
        invoices.forEach(inv => {
            console.log(`ID: ${inv.txId}, Entity: ${inv.entity}, Status: ${inv.status}, Type: ${inv.type}, Amount: ${inv.amount}, TotalPaid: ${inv.totalPaid}`);
        });

        const pendingIds = ['INV-1773911941610', 'INV-1773912063917'];
        for (const id of pendingIds) {
            const children = await Finance.find({ parentInvoiceId: id }).toArray();
            console.log(`\nChildren for ${id}: ${children.length} found`);
            children.forEach(c => {
                console.log(`  - ID: ${c.txId}, Status: ${c.status}, Amount: ${c.amount}`);
            });
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkInvoices();
