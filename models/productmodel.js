const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required']
    },
    description: {
        type: String,
        required: [true, 'Product description is required']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required']
    },
    image: {
        type: String, 
        required: true
    },
    category: {
        type: String,
        required: [true, 'Category is required']
    },
    isPremiumProduct: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
