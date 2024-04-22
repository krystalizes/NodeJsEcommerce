const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;
const Products = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, maxLength: 225 },
        image: { type: String, maxLength: 600 },
        price: { type: Number, maxLength: 600 },
        amount: { type: Number, required: true, maxLength: 225 },
        category: { type: String, required: true, maxLength: 225 },
        slug: { type: String, slug: 'name', unique: true },
    },
    {
        timestamps: true,
    },
);
mongoose.plugin(slug);
Products.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});
module.exports = mongoose.model('Products', Products);
