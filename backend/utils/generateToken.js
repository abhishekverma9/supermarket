import jwt from 'jsonwebtoken';

/**
 * Generate JWT token
 * @param {Object} payload - Must contain { id, role }
 * @param {string} expiresIn - Token expiry (default '1h')
 * @returns {string} JWT token
 */
const generateToken = (payload, expiresIn = '1h') => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in .env');
  }

  if (!payload || !payload.id || !payload.role) {
    throw new Error('Payload must contain id and role');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

export { generateToken };
