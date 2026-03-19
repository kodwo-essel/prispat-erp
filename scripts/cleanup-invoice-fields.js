
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function cleanupInvoices() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);

        const Finance = mongoose.connection.collection('finances');

        console.log("Removing 'status' and 'totalPaid' fields from all invoice documents...");

        const result = await Finance.updateMany(
            { isInvoice: true },
            { $unset: { status: "", totalPaid: "" } }
        );

        console.log(`Updated ${result.modifiedCount} invoices. Fields removed.`);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

cleanupInvoices();
