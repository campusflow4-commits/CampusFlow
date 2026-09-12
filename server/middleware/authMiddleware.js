import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'skillswap_default_secret_2026');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User account no longer exists.' });
    }

    // Feature 26: One Device -> One Account Protection
    const incomingDeviceId = req.headers['x-device-id'];
    if (incomingDeviceId && user.activeDeviceId && user.activeDeviceId !== incomingDeviceId) {
      return res.status(403).json({
        code: 'DEVICE_MISMATCH',
        message: 'Your account was accessed from another device or browser. For safety, please log in again.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
};
