import { db } from "../config/db.js";

// Add a product review
export const addProductReview = async (req, res) => {
  try {
    const { id: product_id } = req.params;
    const { rating, comment } = req.body;
    const consumer_id = req.userId; // Provided by authRole middleware

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Valid rating (1-5) is required" });
    }

    // Check if the product exists
    const [products] = await db().query("SELECT product_id FROM Product WHERE product_id = ?", [product_id]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check if the user already reviewed this product
    const [existingReviews] = await db().query(
      "SELECT review_id FROM Reviews WHERE product_id = ? AND consumer_id = ?",
      [product_id, consumer_id]
    );

    if (existingReviews.length > 0) {
      return res.status(400).json({ success: false, message: "You have already reviewed this product" });
    }

    // Insert review
    await db().query(
      `INSERT INTO Reviews (product_id, consumer_id, rating, comment) VALUES (?, ?, ?, ?)`,
      [product_id, consumer_id, rating, comment || null]
    );

    res.json({ success: true, message: "Review added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { id: product_id } = req.params;

    const [reviews] = await db().query(
      `SELECT r.review_id, r.rating, r.comment, r.created_at, 
              c.first_name, c.last_name 
       FROM Reviews r
       JOIN Consumers c ON r.consumer_id = c.consumer_id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [product_id]
    );

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
