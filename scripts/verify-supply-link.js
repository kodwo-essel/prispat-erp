const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function verify() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);

        const SupplyReceipt = mongoose.connection.collection('supplyreceipts');
        const Supply = mongoose.connection.collection('supplies');
        const Finance = mongoose.connection.collection('finances');

        console.log("--- Verification ---");

        const sampleReceipt = await SupplyReceipt.findOne({ invoiceId: { $exists: true } });
        if (sampleReceipt) {
            console.log(`Receipt ${sampleReceipt.receiptNumber} has invoiceId: ${sampleReceipt.invoiceId}`);

            const finance = await Finance.findOne({ txId: sampleReceipt.invoiceId });
            if (finance) {
                console.log(`Finance record ${finance.txId} found. Status: ${finance.status}, Amount: ${finance.amount}`);
                if (finance.status === 'Unpaid') {
                    console.log("SUCCESS: Finance record is Unpaid.");
                } else {
                    console.log(`WARNING: Finance record status is ${finance.status}, expected Unpaid.`);
                }
            } else {
                console.log(`ERROR: Finance record ${sampleReceipt.invoiceId} not found!`);
            }

            const sampleSupply = await Supply.findOne({ invoiceId: sampleReceipt.invoiceId });
            if (sampleSupply) {
                console.log(`Supply item ${sampleSupply.name} linked to invoice correctly.`);
            } else {
                console.log(`WARNING: No supply items found for invoice ${sampleReceipt.invoiceId}`);
            }
        } else {
            console.log("ERROR: No receipts found with invoiceId.");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Verification failed:", err);
    }
}

verify();
