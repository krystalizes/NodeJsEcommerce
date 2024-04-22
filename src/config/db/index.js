const mongoose = require('mongoose');
async function connected() {
    try {
        await mongoose.connect('mongodb://127.0.0.1/Ecom_nodejs');
        console.log('connect successfully');
    } catch (error) {
        console.log('connect failed');
    }
}
module.exports = { connected };
