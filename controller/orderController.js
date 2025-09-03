import Order from "../models/ordermodel.js";
import Cart from "../models/cartmodel.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import Product from "../models/productmodel.js";   

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const CreateOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, buyNow } = req.body;

    let products = [];
    let totalAmount = 0;

    if (buyNow && productId) {
      // 🔹 Single product Buy Now
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      products = [{
        productId: product._id,
        quantity: quantity || 1,
        price: product.price,
      }];

      totalAmount = product.price * (quantity || 1);
    } else {
      // 🔹 Normal checkout from cart
      const cart = await Cart.findOne({ userId }).populate("products.productId");
      if (!cart || cart.products.length === 0) {
        return res.status(400).json({ message: "Cart is empty!" });
      }

      products = cart.products.map((p) => ({
        productId: p.productId._id,
        quantity: p.quantity,
        price: p.price,
      }));

      totalAmount = cart.totalAmount;
    }

    // Create Order in DB
    const newOrder = await Order.create({
      userId,
      products,
      totalAmount,
      paymentStatus: "pending",
    });

    // Create Razorpay order
    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${newOrder._id}`,
    };

    const rzpOrder = await razorpay.orders.create(options);

    newOrder.razorpayOrderId = rzpOrder.id;
    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
      razorpayOrder: rzpOrder,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("CreateOrder error:", error);
    res.status(500).json({ message: error.message });
  }
};



export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, buyNow } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      let order = null;
      if (orderId) {
        order = await Order.findById(orderId);
      } else {
        order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      }

      if (order) {
        order.paymentStatus = "paid";
        order.paymentId = razorpay_payment_id;
        await order.save();

        // Only clear cart for checkout, not Buy Now
        if (!buyNow) {
          const cart = await Cart.findOne({ userId: order.userId });
          if (cart) {
            order.products.forEach((purchased) => {
              cart.products = cart.products.filter(
                (item) => item.productId.toString() !== purchased.productId.toString()
              );
            });

            cart.totalAmount = cart.products.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );

            await cart.save();
          }
        }
      }
      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error("verifyPayment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId, paymentStatus: "paid" })
      .populate("products.productId", "name image price")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};
