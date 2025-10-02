import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

// Signup for consumers
export const signup = async (req, res) => {
  try {
    const { name, email, password, phone, house_no, street, building_or_flat } = req.body;

    const userId = await User.create({ name, email, password, phone, house_no, street, building_or_flat });
    if (!userId) return res.status(400).json({ message: 'Email already exists' });

    // Generate JWT token
    const token = generateToken({ userId, email });

    res.status(201).json({
      message: 'Consumer registered successfully',
      userId,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login for consumers
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    // Generate JWT token
    const token = generateToken({ userId: user.consumer_id, email });

    res.json({
      message: 'Login successful',
      user: {
        id: user.consumer_id,
        name: user.first_name,
        email: user.email,
        phone: user.phone
      },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
