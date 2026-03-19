
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function checkInconsistency() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);

        const Finance = mongoose.connection.collection('finances');
        const invoices = await Finance.find({ isInvoice: true }).toArray();

        console.log(`Found ${invoices.length} invoices. Checking for inconsistencies...`);

        for (const inv of invoices) {
            const payments = await Finance.find({ parentInvoiceId: inv.txId, status: "Settled" }).toArray();
            const totalPaidFromPayments = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

            let calculatedStatus = "Pending";
            if (totalPaidFromPayments >= inv.amount) {
                calculatedStatus = "Settled";
            } else if (totalPaidFromPayments > 0) {
                calculatedStatus = "Partial";
            }

            if (inv.status !== calculatedStatus || (inv.totalPaid || 0) !== totalPaidFromPayments) {
                console.log(`INCONSISTENCY FOUND for ${inv.txId}:`);
                console.log(`  Stored: Status=${inv.status}, totalPaid=${inv.totalPaid || 0}`);
                console.log(`  Actual: Status=${calculatedStatus}, totalPaid=${totalPaidFromPayments} (from ${payments.length} payments)`);
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkInconsistency();
