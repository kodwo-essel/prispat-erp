
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function checkOrders() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri);

        const Order = mongoose.connection.collection('orders');
        const orders = await Order.find({}).sort({ createdAt: -1 }).limit(10).toArray();

        console.log(`Found ${orders.length} recent orders`);
        orders.forEach(o => {
            console.log(`OrderID: ${o.orderId}, Customer: ${o.customer?.name}, Total: ${o.totalAmount}, SaleType: ${o.saleType}, Status: ${o.status}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkOrders();
