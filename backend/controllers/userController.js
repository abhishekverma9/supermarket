import { db } from "../config/db.js";
import imagekit from "../config/imageKit.js";

// Get consumer profile
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await db().query("SELECT consumer_id, first_name, last_name, email, phone, loyalty_points, house_no, street, building, profile_photo FROM Consumers WHERE consumer_id = ?", [userId]);

    if (rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user: rows[0] });
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

    const [existing] = await db().query("SELECT * FROM Consumers WHERE consumer_id = ?", [userId]);
    if (existing.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    let profilePhotoUrl = existing[0].profile_photo;
    if (req.file) {
      const result = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: "/profile_photos"
      });
      profilePhotoUrl = result.url;
    }
    await db().query(
      `UPDATE Consumers SET first_name=?, last_name=?, phone=?, house_no=?, street=?, building_or_flat=?, profile_photo=? WHERE consumer_id=?`,
      [
        first_name || existing[0].first_name,
        last_name || existing[0].last_name,
        phone || existing[0].phone,
        house_no || existing[0].house_no,
        street || existing[0].street,
        building || existing[0].building,
        profilePhotoUrl,
        userId
      ]
    );
    res.json({success: true,message: "Profile updated successfully",profile_photo: profilePhotoUrl})
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { getProfile, updateProfile };
