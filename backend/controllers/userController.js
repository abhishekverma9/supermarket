import { db } from "../config/db.js";
import imagekit from "../config/imageKit.js";

// Get consumer profile
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await db().query(
      `SELECT consumer_id, first_name, last_name, email, phone, loyalty_points, house_no, street, building, profile_photo 
       FROM consumers 
       WHERE consumer_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Update consumer profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { first_name, last_name, phone, house_no, street, building } = req.body;

    const existingResult = await db().query(
      "SELECT * FROM consumers WHERE consumer_id = $1",
      [userId]
    );
    if (existingResult.rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    let profilePhotoUrl = existingResult.rows[0].profile_photo;
    if (req.file) {
      const result = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: "/profile_photos"
      });
      profilePhotoUrl = result.url;
    }

    await db().query(
      `UPDATE consumers 
       SET first_name = $1, last_name = $2, phone = $3, house_no = $4, street = $5, building_or_flat = $6, profile_photo = $7
       WHERE consumer_id = $8`,
      [
        first_name || existingResult.rows[0].first_name,
        last_name || existingResult.rows[0].last_name,
        phone || existingResult.rows[0].phone,
        house_no || existingResult.rows[0].house_no,
        street || existingResult.rows[0].street,
        building || existingResult.rows[0].building,
        profilePhotoUrl,
        userId
      ]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile_photo: profilePhotoUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { getProfile, updateProfile };
