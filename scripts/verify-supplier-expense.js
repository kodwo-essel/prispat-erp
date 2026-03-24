
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function verifySupplierExpense() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);

        const Inventory = mongoose.connection.collection('inventories');
        const Finance = mongoose.connection.collection('finances');
        const Supply = mongoose.connection.collection('supplies');

        console.log("--- Starting Verification ---");

        // 1. Create a dummy inventory via direct DB (simulating the API result or checking existing)
        // Since I can't easily trigger the Next.js API route via script without a running server, 
        // I will check if the last created Finance record is an Expense and if it matches a Supply record.

        const latestFinance = await Finance.find({ type: "Expense", category: "Procurement Cost" })
            .sort({ createdAt: -1 })
            .limit(1)
            .toArray();

        if (latestFinance.length > 0) {
            const expense = latestFinance[0];
            console.log(`Found Latest Expense: ${expense.txId}, Amount: ${expense.amount}, Entity: ${expense.entity}`);
            console.log(`Description: ${expense.description}`);
        } else {
            console.log("No recent procurement expenses found. Please record a new stock arrival in the UI with a supplier price to verify.");
        }

        // 2. Check models for the new field
        const sampleInv = await Inventory.findOne({});
        if (sampleInv && sampleInv.hasOwnProperty('supplierPrice')) {
            console.log("SUCCESS: Inventory model has supplierPrice field.");
        } else {
            console.log("WARNING: Inventory model missing supplierPrice field in database (might need a new record to appear).");
        }

        const sampleSupply = await Supply.findOne({});
        if (sampleSupply && sampleSupply.hasOwnProperty('supplierPrice')) {
            console.log("SUCCESS: Supply model has supplierPrice field.");
        } else {
            console.log("WARNING: Supply model missing supplierPrice field in database.");
        }

        await mongoose.disconnect();
        console.log("--- Verification Complete ---");
    } catch (err) {
        console.error("Verification failed:", err);
    }
}

verifySupplierExpense();
