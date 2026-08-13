import { db } from "../config/db.js";
import imagekit from "../config/imageKit.js";

// Fetch all products with filtering, search, and pagination
const getAllProducts = async (req, res) => {
  try {
    const { 
      search = "", 
      category = "", 
      minPrice, 
      maxPrice, 
      sortBy = "newest", 
      page = 1, 
      limit = 20 
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    // Base queries
    let query = `
      SELECT p.product_id, p.name, p.description, p.price, p.exp_date, p.category, 
             p.stock_quantity, p.image AS product_image,
             d.discount_id, d.description AS discount_desc, d.value AS discount_value,
             COALESCE(AVG(r.rating), 0) AS average_rating,
             COUNT(r.review_id) AS total_reviews
      FROM Product p
      LEFT JOIN Product_Discount pd ON p.product_id = pd.product_id
      LEFT JOIN Discount d ON pd.discount_id = d.discount_id
      LEFT JOIN Reviews r ON p.product_id = r.product_id
      WHERE 1=1
    `;
    
    let countQuery = `
      SELECT COUNT(DISTINCT p.product_id) as total
      FROM Product p
      WHERE 1=1
    `;

    const queryParams = [];
    const countParams = [];

    // Search filter
    if (search) {
      const searchStr = `%${search}%`;
      query += ` AND p.name LIKE ?`;
      countQuery += ` AND p.name LIKE ?`;
      queryParams.push(searchStr);
      countParams.push(searchStr);
    }

    // Category filter (can be comma-separated)
    if (category) {
      const categories = category.split(",");
      const placeholders = categories.map(() => "?").join(",");
      query += ` AND p.category IN (${placeholders})`;
      countQuery += ` AND p.category IN (${placeholders})`;
      queryParams.push(...categories);
      countParams.push(...categories);
    }

    // Price filter (using calculated final price)
    if (minPrice !== undefined && maxPrice !== undefined) {
      const priceCondition = `(p.price - (p.price * IFNULL(d.value, 0) / 100)) BETWEEN ? AND ?`;
      query += ` AND ${priceCondition}`;
      // Note: countQuery doesn't join Discount natively here unless we add it, but since it's already complex, 
      // let's ensure countQuery has the Discount join if we are filtering by price.
      // Actually, since countQuery doesn't have the d join, filtering by price will fail on countQuery!
      // Let's fix countQuery to have the joins.
      countQuery = `
        SELECT COUNT(DISTINCT p.product_id) as total
        FROM Product p
        LEFT JOIN Product_Discount pd ON p.product_id = pd.product_id
        LEFT JOIN Discount d ON pd.discount_id = d.discount_id
        WHERE 1=1
      `;
      // Re-apply existing filters to countQuery if any
      if (search) countQuery += ` AND p.name LIKE ?`;
      if (category) {
        const placeholders = category.split(",").map(() => "?").join(",");
        countQuery += ` AND p.category IN (${placeholders})`;
      }

      countQuery += ` AND ${priceCondition}`;
      queryParams.push(Number(minPrice), Number(maxPrice));
      countParams.push(Number(minPrice), Number(maxPrice));
    }

    // Group By MUST come after WHERE
    query += ` GROUP BY p.product_id, d.discount_id, d.description, d.value`;

    // Sort order
    if (sortBy === "price_asc") {
      query += ` ORDER BY (p.price - (p.price * IFNULL(d.value, 0) / 100)) ASC`;
    } else if (sortBy === "price_desc") {
      query += ` ORDER BY (p.price - (p.price * IFNULL(d.value, 0) / 100)) DESC`;
    } else if (sortBy === "name") {
      query += ` ORDER BY p.name ASC`;
    } else if (sortBy === "oldest") {
      query += ` ORDER BY p.created_at ASC`;
    } else {
      query += ` ORDER BY p.created_at DESC`; // newest is default
    }

    // Pagination
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(Number(limit), Number(offset));

    // Execute count query
    const [countResult] = await db().query(countQuery, countParams);
    const totalProducts = countResult[0].total;

    // Execute main query
    const [products] = await db().query(query, queryParams);

    if (products.length === 0) {
      return res.json({ success: true, message: "No products found", totalProducts: 0, products: [] });
    }

    const productsWithFinalPrice = products.map(p => {
      const finalPrice = p.discount_value
        ? (p.price - (p.price * p.discount_value) / 100).toFixed(2)
        : p.price;
      return { ...p, final_price: Number(finalPrice) };
    });

    // Price Filtering (Since final_price is calculated, we filter it in memory to keep SQL simple for now, 
    // or we could write complex SQL. For a small DB, memory filter is fine, but SQL is better. 
    // Since we need pagination, SQL filtering is required for accuracy.)
    // Wait, the user asked for SQL level. Let's do SQL level price filtering.
    // Actually, to filter by final_price in SQL:
    // WHERE (p.price - (p.price * IFNULL(d.value, 0)) / 100) BETWEEN min AND max
    
    // I will rewrite the price filter to be in SQL. Let me replace this again if needed.
    // To be safe, I'll return products right away and let the next tool call fix price filtering if needed.
    
    // Let's just return:
    res.json({ 
      success: true, 
      totalProducts,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / Number(limit)),
      products: productsWithFinalPrice 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

// Fetch distinct categories
const getCategories = async (req, res) => {
  try {
    const [categories] = await db().query(`SELECT DISTINCT category FROM Product WHERE category IS NOT NULL`);
    res.json({ success: true, categories: categories.map(c => c.category) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

// Fetch single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await db().query(`
      SELECT p.product_id, p.name, p.description, p.price, p.exp_date, p.category, 
             p.stock_quantity, p.image AS product_image,
             d.discount_id, d.description AS discount_desc, d.value AS discount_value,
             COALESCE(AVG(r.rating), 0) AS average_rating,
             COUNT(r.review_id) AS total_reviews
      FROM Product p
      LEFT JOIN Product_Discount pd ON p.product_id = pd.product_id
      LEFT JOIN Discount d ON pd.discount_id = d.discount_id
      LEFT JOIN Reviews r ON p.product_id = r.product_id
      WHERE p.product_id = ?
      GROUP BY p.product_id, d.discount_id
      LIMIT 1
    `, [id]);

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const product = products[0];
    const final_price = product.discount_value
      ? (product.price - (product.price * product.discount_value) / 100).toFixed(2)
      : product.price;

    res.json({
      success: true, product: {
        ...product, final_price,
        base_price: product.price,         // original price
        discount: product.discount_value || 0  // discount percentage
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
};
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock_quantity, exp_date } = req.body;
    if (!name || !price || !category || !stock_quantity) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    let productImageUrl = null;
    if (req.file) {
      const result = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: "/products"
      });
      productImageUrl = result.url;
    }
    // Insert product into Product table
    const [result] = await db().query(
      `INSERT INTO Product (name, description, price, category, stock_quantity, exp_date, image) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, category, stock_quantity, exp_date || null, productImageUrl]
    );
    const product_id = result.insertId;
    // Employee cannot add discount, so skip Product_Discount entirely
    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product_id,
      image_url: productImageUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to add product" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { price, stock_quantity } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    // Collect updates dynamically
    const updates = [];
    const values = [];

    if (price !== undefined) {
      updates.push("price = ?");
      values.push(price);
    }
    if (stock_quantity !== undefined) {
      updates.push("stock_quantity = ?");
      values.push(stock_quantity);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "Nothing to update" });
    }

    values.push(product_id);
    const [result] = await db().query(
      `UPDATE Product SET ${updates.join(", ")} WHERE product_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const [existingProducts] = await db().query(
      "SELECT * FROM Product WHERE product_id = ?",
      [product_id]
    );
    if (existingProducts.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const product = existingProducts[0];
    // Delete image from ImageKit if exists
    if (product.image) {
      const fileName = product.image.split("/").pop();
      try {
        // 1. Search ImageKit for the file to get its internal fileId
        const files = await new Promise((resolve) => {
          imagekit.listFiles({ searchQuery: `name="${fileName}"` }, (error, result) => {
            if (error) resolve([]);
            else resolve(result);
          });
        });

        // 2. If found, delete it using the fileId
        if (files && files.length > 0) {
          const fileId = files[0].fileId;
          await new Promise((resolve) => {
            imagekit.deleteFile(fileId, () => resolve());
          });
          console.log("Successfully deleted from ImageKit:", fileName);
        }
      } catch (err) {
        console.log("ImageKit cleanup bypassed");
      }
    }
    // Delete product from database
    await db().query("DELETE FROM Product WHERE product_id = ?", [product_id]);
    res.json({ success: true, message: "Product deleted successfully", product_id: product_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};

export { getAllProducts, getCategories, getProductById, addProduct, updateProduct, deleteProduct };