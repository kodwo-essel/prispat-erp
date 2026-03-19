const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

// Define Schema (Simplified for deletion)
const FinanceSchema = new mongoose.Schema({
    txId: String
});

const Finance = mongoose.models.Finance || mongoose.model('Finance', FinanceSchema);

async function deleteTransactions() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully.');

        const txIdsToDelete = ['TX-9001', 'TX-9002'];

        console.log(`Searching for transactions: ${txIdsToDelete.join(', ')}`);

        const found = await Finance.find({ txId: { $in: txIdsToDelete } });
        console.log(`Found ${found.length} matching transactions.`);

        if (found.length > 0) {
            const result = await Finance.deleteMany({ txId: { $in: txIdsToDelete } });
            console.log(`Successfully deleted ${result.deletedCount} transactions.`);
        } else {
            console.log('No transactions found to delete.');
        }

    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

deleteTransactions();
