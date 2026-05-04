const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

const MAX_IDLE_TIME = 30 * 60 * 1000; // 30 mins

const protect = async (req, res, next) => {
    let accessToken;
    let refreshToken;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        accessToken = req.headers.authorization.split(' ')[1];
    }
    
    // Check custom refresh header for session tracking
    refreshToken = req.headers['x-refresh-token'];

    console.log(`[AUTH] Accessing protected route: ${req.url}. Access Token: ${accessToken ? 'PRESENT' : 'MISSING'}`);

    if (!accessToken) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET || 'fallback_secret');
        
        // Find session for this user to track activity
        // If we don't have a refresh token header, we might still allow the request 
        // but session tracking (idle timeout) will be limited or we can skip it.
        const session = await Session.findOne({ 
            userId: decoded.id, 
            refreshToken: refreshToken || { $exists: true }, 
            isValid: true 
        });

        if (!session) {
            return res.status(401).json({ message: 'Session invalid or expired' });
        }

        // Idle Timeout Tracking
        const now = Date.now();
        const lastActivity = session.lastActivity.getTime();
        if (now - lastActivity > MAX_IDLE_TIME) {
            await session.deleteOne();
            return res.status(401).json({ message: 'Session expired due to inactivity' });
        }

        // Update server-side activity
        session.lastActivity = now;
        await session.save();

        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }
        
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const superVisorOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'supervisor' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized, requires supervisor privileges' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized, requires admin privileges' });
    }
};

module.exports = { protect, superVisorOnly, adminOnly };
