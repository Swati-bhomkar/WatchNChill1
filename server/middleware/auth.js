// middleware/auth.js
import User from '../models/User.js';

export const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const user = await User.findById(token);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token or user not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[protectAdmin] error:', error);
    return res.status(500).json({ success: false, message: 'Server error in auth' });
  }
};

export const protectUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const user = await User.findById(token);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token or user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[protectUser] error:', error);
    return res.status(500).json({ success: false, message: 'Server error in auth' });
  }
};
