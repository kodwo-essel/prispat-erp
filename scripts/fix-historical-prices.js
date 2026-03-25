const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const Finance = mongoose.connection.db.collection('finances');
        const SupplyReceipt = mongoose.connection.db.collection('supplyreceipts');
        const Inventory = mongoose.connection.db.collection('inventories');

        const receipts = await SupplyReceipt.find({}).toArray();
        console.log(`Auditing ${receipts.length} supply receipts...`);

        for (const receipt of receipts) {
            let totalAmount = 0;
            let itemsUpdated = false;

            for (const item of receipt.items) {
                // Find matching inventory item to get the REAL supplier price
                const invItem = await Inventory.findOne({
                    sku: item.sku,
                    batchId: item.batchId
                });

                if (invItem && invItem.supplierPrice > 0) {
                    item.supplierPrice = invItem.supplierPrice;
                    itemsUpdated = true;
                } else if (!item.supplierPrice || item.supplierPrice === 0) {
                    // If no supplierPrice found in inventory, use unitPrice (selling price) as fallback 
                    // but keep track that it might be suboptimal
                    item.supplierPrice = item.unitPrice;
                }

                totalAmount += (item.quantity * item.supplierPrice);
            }

            if (itemsUpdated || totalAmount !== receipt.totalAmount) {
                console.log(`Updating Receipt ${receipt.receiptNumber}: ${receipt.totalAmount} -> ${totalAmount}`);

                await SupplyReceipt.updateOne(
                    { _id: receipt._id },
                    { $set: { items: receipt.items, totalAmount: totalAmount } }
                );

                // Also update the linked Finance record if it exists
                if (receipt.invoiceId) {
                    const financeUpdate = await Finance.updateOne(
                        { txId: receipt.invoiceId },
                        { $set: { amount: totalAmount } }
                    );
                    if (financeUpdate.modifiedCount > 0) {
                        console.log(` - Linked Finance record ${receipt.invoiceId} updated to ${totalAmount}`);
                    }
                }
            }
        }

        console.log('Data correction complete');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit(0);
    }
}

migrate();
