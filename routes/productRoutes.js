const express = require('express');
const { CreateProduct, GetallProducts, SingleProduct, UpdateProduct, DeleteProduct , GetProductsByCategory } = require('../controller/productController');
const isAdmin = require('../middleware/isAdmin');
const authMiddleware = require('../middleware/authmiddleware');

const productrouter = express.Router();

productrouter.post('/create', authMiddleware , isAdmin , CreateProduct);
productrouter.get('/getallproducts' ,  GetallProducts);
productrouter.get('/getsingleproduct/:id' , SingleProduct);
productrouter.get('/category/:category', GetProductsByCategory);
productrouter.put('/update/:id', authMiddleware , isAdmin , UpdateProduct);
productrouter.delete('/deleteproduct/:id', authMiddleware , isAdmin , DeleteProduct);

module.exports = productrouter;
