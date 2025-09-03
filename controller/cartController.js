const cartSchema = require('../models/cartmodel');
const Product = require('../models/productmodel');

module.exports.Addtocart = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await cartSchema.findOne({ userId });

    if (!cart) {
      cart = await cartSchema.create({
        userId,
        products: [{ productId, quantity, price: product.price }],
        totalAmount: quantity * product.price, // ✅ fixed
      });
      await cart.populate("products.productId"); // ✅ populate before returning
      return res.status(201).json({ message: 'Product added to cart', cart });
    }

    const productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId.toString()
    );

    if (productIndex > -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ productId, quantity, price: product.price });
    }

    cart.totalAmount = cart.products.reduce(
      (acc, item) => acc + item.price * item.quantity, 0
    );

    await cart.save();
    await cart.populate("products.productId"); // ✅ always populate
    res.status(200).json({ message: 'Cart updated successfully', cart });

  } catch (error) {
    console.error('Error adding to cart:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports.Getcart = async (req, res) => {
  try {
    const userId = req.user.id;  
    const cart = await cartSchema.findOne({ userId }).populate('products.productId');

    if (!cart) {
      return res.status(404).json({ message: "Cart not found for this user" });
    }

    res.status(200).json({ message: "Cart fetched successfully", cart });
  } catch (error) {
    console.error("Error while fetching cart", error.message);
    res.status(400).json({ message: error.message });
  }
};

module.exports.Updatecart = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;  
    const { quantity } = req.body;    

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    let cart = await cartSchema.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found for this user" });
    }

    const productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId.toString()
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    cart.products[productIndex].quantity = quantity;

    cart.totalAmount = cart.products.reduce(
      (acc, item) => acc + item.price * item.quantity, 0
    );

    await cart.save();
    await cart.populate("products.productId"); // ✅ populate before returning

    res.status(200).json({ message: "Cart updated successfully", cart });
  } catch (error) {
    console.error("Error updating cart:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports.Deleteitem = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    let cart = await cartSchema.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found for this user" });
    }

    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId.toString()
    );

    cart.totalAmount = cart.products.reduce(
      (acc, item) => acc + item.price * item.quantity, 0
    );

    await cart.save();
    await cart.populate("products.productId"); // ✅ populate before returning

    res.status(200).json({ message: "Product removed from cart", cart });
  } catch (error) {
    console.error("Error removing item from cart:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports.Clearcart = async (req,res) => {
  try {
    const userId = req.user.id; 
    let cart = await cartSchema.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found for this user" });
    }

    cart.products = [];
    cart.totalAmount = 0;

    await cart.save();
    await cart.populate("products.productId"); // ✅ populate before returning

    res.status(200).json({ message: "Cart cleared successfully", cart });

  } catch (error) {
    console.error("error while clear cart" , error.message)
    res.status(500).json({message:error.message})
  }
};
