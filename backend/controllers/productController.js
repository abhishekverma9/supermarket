import { db } from "../config/db.js";
import imagekit from "../config/imageKit.js";

// Fetch all products
const getAllProducts = async (req, res) => {
  try {
    const result = await db().query(`
      SELECT 
        p.product_id, 
        p.name, 
        p.description, 
        p.price, 
        p.exp_date, 
        p.category, 
        p.stock_quantity, 
        p.image AS product_image, 
        d.discount_id, 
        d.description AS discount_desc, 
        d.value AS discount_value
      FROM Product p
      LEFT JOIN Product_Discount pd ON p.product_id = pd.product_id
      LEFT JOIN Discount d ON pd.discount_id = d.discount_id
      ORDER BY p.product_id ASC
    `);

    const products = result.rows;

    if (products.length === 0) {
      return res.json({ success: false, message: "No products found" });
    }

    const productsWithFinalPrice = products.map(p => ({
      ...p,
      final_price: p.discount_value
        ? (p.price - (p.price * p.discount_value) / 100).toFixed(2)
        : p.price
    }));

    res.json({
      success: true,
      count: productsWithFinalPrice.length,
      products: productsWithFinalPrice
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


// Fetch single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db().query(`
      SELECT p.product_id, p.name, p.description, p.price, p.exp_date, p.category, 
             p.stock_quantity, p.image AS product_image,
             d.discount_id, d.description AS discount_desc, d.value AS discount_value
      FROM Product p
      LEFT JOIN Product_Discount pd ON p.product_id = pd.product_id
      LEFT JOIN Discount d ON pd.discount_id = d.discount_id
      WHERE p.product_id = $1
      LIMIT 1
    `, [id]);

    const products = result.rows;

    if (products.length === 0) {
      return res.json({ success: false, message: "Product not found" });
    }

    const product = products[0];
    const final_price = product.discount_value
      ? (product.price - (product.price * product.discount_value) / 100).toFixed(2)
      : product.price;

    res.json({
      success: true,
      product: {
        ...product,
        final_price,
        base_price: product.price,
        discount: product.discount_value || 0
      }
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Add new product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock_quantity, exp_date } = req.body;

    if (!name || !price || !category || !stock_quantity) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    let productImageUrl = null;
    if (req.file) {
      const upload = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: "/products"
      });
      productImageUrl = upload.url;
    }

    const insertQuery = `
      INSERT INTO Product (name, description, price, category, stock_quantity, exp_date, image) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING product_id
    `;
    const result = await db().query(insertQuery, [
      name,
      description || null,
      price,
      category,
      stock_quantity,
      exp_date || null,
      productImageUrl
    ]);

    res.json({
      success: true,
      message: "Product added successfully",
      product_id: result.rows[0].product_id,
      image_url: productImageUrl
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { price, stock_quantity } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const updates = [];
    const values = [];
    let index = 1;

    if (price !== undefined) {
      updates.push(`price = $${index++}`);
      values.push(price);
    }
    if (stock_quantity !== undefined) {
      updates.push(`stock_quantity = $${index++}`);
      values.push(stock_quantity);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "Nothing to update" });
    }

    values.push(product_id);
    const query = `UPDATE Product SET ${updates.join(", ")} WHERE product_id = $${index}`;
    const result = await db().query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { product_id } = req.params;

    const result = await db().query("SELECT * FROM Product WHERE product_id = $1", [product_id]);
    if (result.rows.length === 0) {
      return res.json({ success: false, message: "Product not found" });
    }

    const product = result.rows[0];

    if (product.image) {
      const fileName = product.image.split("/").pop();
      try {
        await imagekit.deleteFile(fileName);
      } catch (err) {
        console.log("ImageKit delete error:", err.message);
      }
    }

    await db().query("DELETE FROM Product WHERE product_id = $1", [product_id]);
    res.json({ success: true, message: "Product deleted successfully", product_id });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
};
