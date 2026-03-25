
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function verifyApi() {
    await mongoose.connect(process.env.MONGODB_URI);

    const SupplyReceipt = mongoose.models.SupplyReceipt || mongoose.model('SupplyReceipt', new mongoose.Schema({
        receiptNumber: String,
        invoiceId: String
    }));

    const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', new mongoose.Schema({
        sku: String,
        batchId: String
    }));

    const Finance = mongoose.models.Finance || mongoose.model('Finance', new mongoose.Schema({
        txId: String,
        amount: Number,
        status: String
    }));

    // Find a receipt with an invoiceId
    const receipt = await SupplyReceipt.findOne({ invoiceId: { $exists: true } });
    if (receipt) {
        console.log(`Testing Receipt: ${receipt.receiptNumber}`);
        const finance = await Finance.findOne({ txId: receipt.invoiceId });
        if (finance) {
            console.log(`Found linked finance record: ${finance.txId}, Status: ${finance.status}`);
        } else {
            console.log(`FAILED: No finance record for ${receipt.invoiceId}`);
        }
    } else {
        console.log("No receipts with invoiceId found.");
    }

    // Find an inventory item with a linked supply
    const item = await Inventory.findOne();
    if (item) {
        console.log(`Testing Inventory Item: ${item.sku} / ${item.batchId}`);
        const Supply = mongoose.models.Supply || mongoose.model('Supply', new mongoose.Schema({
            sku: String,
            batchId: String,
            invoiceId: String
        }));
        const supply = await Supply.findOne({ sku: item.sku, batchId: item.batchId });
        if (supply && supply.invoiceId) {
            console.log(`Found linked invoice: ${supply.invoiceId}`);
            const finance = await Finance.findOne({ txId: supply.invoiceId });
            if (finance) {
                console.log(`Found linked finance record: ${finance.txId}, Status: ${finance.status}`);
            }
        } else {
            console.log("No linked supply/invoice for this inventory item.");
        }
    }

    await mongoose.disconnect();
}

verifyApi().catch(console.error);
