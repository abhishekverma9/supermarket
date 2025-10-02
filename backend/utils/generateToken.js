import jwt from 'jsonwebtoken';

export const generateToken = (payload, expiresIn = '1h') => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in .env');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};
