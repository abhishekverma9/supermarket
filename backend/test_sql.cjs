const mysql = require('mysql2/promise');

async function run() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'supermarket'
    });

    const query = `
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
      GROUP BY p.product_id, d.discount_id, d.description, d.value
      ORDER BY p.created_at DESC
      LIMIT 20 OFFSET 0
    `;

    const [rows] = await conn.query(query);
    console.log('SUCCESS, count:', rows.length);
    conn.end();
  } catch (e) {
    console.error('SQL ERROR:', e.message);
  }
}

run();
