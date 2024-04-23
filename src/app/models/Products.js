const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;
const Products = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        image: [
            {
                url: {
                    type: String,
                    required: true,
                },
                public_id: {
                    type: String,
                    required: true,
                },
            },
        ],
        price: { type: Number, maxLength: 20 },
        amount: { type: Number, required: true, maxLength: 225 },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Categories',
            required: true,
        },
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
