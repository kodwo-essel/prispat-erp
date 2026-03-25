const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Use any to bypass schema validation for existing documents during update
        const Finance = mongoose.connection.db.collection('finances');
        const SupplyReceipt = mongoose.connection.db.collection('supplyreceipts');
        const Supply = mongoose.connection.db.collection('supplies');

        const migratedFinances = await Finance.find({ txId: /MIGR$/ }).toArray();
        console.log(`Found ${migratedFinances.length} migrated finance records`);

        for (const fin of migratedFinances) {
            const oldId = fin.txId;
            const newId = oldId.replace('-MIGR', '');
            console.log(`Renaming ${oldId} to ${newId}`);

            await Finance.updateOne({ _id: fin._id }, { $set: { txId: newId } });
            await SupplyReceipt.updateMany({ invoiceId: oldId }, { $set: { invoiceId: newId } });
            await Supply.updateMany({ invoiceId: oldId }, { $set: { invoiceId: newId } });
        }

        console.log('Migration complete');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit(0);
    }
}

migrate();
