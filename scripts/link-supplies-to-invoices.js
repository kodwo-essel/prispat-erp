const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function migrate() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGODB_URI is not defined");

        await mongoose.connect(uri);
        console.log("Connected to MongoDB.");

        const SupplyReceipt = mongoose.connection.collection('supplyreceipts');
        const Supply = mongoose.connection.collection('supplies');
        const Finance = mongoose.connection.collection('finances');

        const receipts = await SupplyReceipt.find({}).toArray();
        console.log(`Found ${receipts.length} supply receipts.`);

        for (const receipt of receipts) {
            console.log(`Processing receipt: ${receipt.receiptNumber} (${receipt.supplier})`);

            let txId = receipt.invoiceId;
            let existingFinance = null;

            if (txId) {
                existingFinance = await Finance.findOne({ txId: txId });
            } else {
                // Try to find by receipt number in description
                existingFinance = await Finance.findOne({
                    type: "Expense",
                    description: { $regex: receipt.receiptNumber }
                });
            }

            if (existingFinance) {
                txId = existingFinance.txId;
                console.log(`  Found existing finance record: ${txId}`);

                // Update finance record to Unpaid
                await Finance.updateOne(
                    { _id: existingFinance._id },
                    {
                        $set: {
                            status: "Unpaid",
                            totalPaid: 0,
                            isInvoice: true // Ensure it's marked as an invoice
                        }
                    }
                );
                console.log(`  Updated finance status to Unpaid.`);
            } else {
                // Create new finance record
                txId = `EXP-REC-${receipt.receiptNumber}-MIGR`;
                console.log(`  No finance record found. Creating new one: ${txId}`);

                await Finance.insertOne({
                    txId: txId,
                    entity: receipt.supplier,
                    amount: receipt.totalAmount || 0,
                    type: "Expense",
                    category: "Procurement",
                    status: "Unpaid",
                    isInvoice: true,
                    date: receipt.arrivalDate || new Date(),
                    description: `Bulk procurement shipment: REF #${receipt.receiptNumber} (${receipt.items.length} items) [MIGRATED]`,
                    recordedBy: "Migration Script",
                    totalPaid: 0,
                    paymentLog: [],
                    auditTrail: [{
                        action: "Created via Migration Script",
                        by: "Migration Script",
                        time: new Date()
                    }],
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }

            // Update receipt with invoiceId
            await SupplyReceipt.updateOne(
                { _id: receipt._id },
                { $set: { invoiceId: txId } }
            );

            // Update all supplies associated with this receipt
            // Note: Supplies are linked by supplier and batchId (from receipt items)
            // Or more reliably, we can try to match by name, sku, and arrivalDate
            for (const item of receipt.items) {
                await Supply.updateMany(
                    {
                        sku: item.sku,
                        batchId: item.batchId,
                        supplier: receipt.supplier
                    },
                    { $set: { invoiceId: txId } }
                );
            }
            console.log(`  Linked supply items to invoice ${txId}.`);
        }

        console.log("Migration completed successfully.");
        await mongoose.disconnect();
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
