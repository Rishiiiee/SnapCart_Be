const productSchema = require('../models/productmodel')

module.exports.CreateProduct = async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body;

        if (!name || !description || !price || !image || !category) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newProduct = await productSchema.create({
            name,
            description,
            price,
            category,
            image
        });

        res.status(201).json({ message: "Product created successfully", product: newProduct });
    } catch (error) {
        console.error("Error while creating product:", error.message);
        res.status(500).json({ message: error.message });
    }
};

module.exports.GetallProducts = async (req, res) => {
    try {
        const products = await productSchema.find();
        res.status(200).json({ message: "All products fetched successfully", products });
    } catch (error) {
        console.error("Error while fetching products:", error.message);
        res.status(500).json({ message: error.message });
    }
};

module.exports.SingleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productSchema.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product fetched successfully", product });
    } catch (error) {
        console.error("Error while fetching product:", error.message);
        res.status(500).json({ message: error.message });
    }
};

module.exports.UpdateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedProduct = await productSchema.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        console.error("Error while updating product:", error.message);
        res.status(500).json({ message: error.message });
    }
};


module.exports.DeleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedProduct = await productSchema.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error while deleting product:", error.message);
        res.status(500).json({ message: error.message });
    }
};

module.exports.GetProductsByCategory = async (req, res) => {
  try {
    const categoryName = req.params.category;

    const products = await productSchema.find({
      category: { $regex: new RegExp(`^${categoryName}$`, "i") } 
    });

    if (!products.length) {
      return res.status(404).json({ message: "No products found in this category" });
    }

    res.status(200).json({ message: "Products fetched successfully", products });
  } catch (error) {
    console.error("Error while fetching category products:", error.message);
    res.status(500).json({ message: error.message });
  }
};
