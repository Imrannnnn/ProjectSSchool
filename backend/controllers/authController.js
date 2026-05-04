const User = require('../models/User');
const Session = require('../models/Session');
const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_EXPIRY = '15m'; // 15 mins
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
const MAX_IDLE_TIME = 30 * 60 * 1000; // 30 mins idle
const COOKIE_NAME_ACCESS = 'fpn_access_token';
const COOKIE_NAME_REFRESH = 'fpn_refresh_token';

const generateTokens = (id) => {
    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret_key', { expiresIn: REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken) => {
    // Hardcoded for Netlify -> Render cross-domain deployment
    const cookieOptions = {
        httpOnly: true,
        secure: true, 
        sameSite: 'none',
        path: '/'
    };

    res.cookie(COOKIE_NAME_ACCESS, accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie(COOKIE_NAME_REFRESH, refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

const registerUser = async (req, res) => {
    const { role, identifier, name, password, supervisorId } = req.body;

    try {
        const userExists = await User.findOne({ identifier });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const userObj = { role, identifier, name, password };
        if (role === 'student' && supervisorId) userObj.supervisor = supervisorId;

        const user = await User.create(userObj);
        if (user) {
            const { accessToken, refreshToken } = generateTokens(user._id);
            
            await Session.create({
                userId: user._id, 
                refreshToken, 
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip
            });

            setCookies(res, accessToken, refreshToken);

            res.status(201).json({
                _id: user._id,
                identifier: user.identifier,
                name: user.name,
                role: user.role,
                supervisor: user.supervisor
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        const user = await User.findOne({ identifier });

        if (user && (await user.matchPassword(password))) {
            const { accessToken, refreshToken } = generateTokens(user._id);
            
            // Allow multiple sessions but we could also invalidate old ones here for rotation
            await Session.create({
                userId: user._id, 
                refreshToken, 
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip
            });

            setCookies(res, accessToken, refreshToken);

            res.json({
                _id: user._id,
                identifier: user.identifier,
                name: user.name,
                role: user.role,
                supervisor: user.supervisor
            });
        } else {
            res.status(401).json({ message: 'Invalid identifier or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const logoutUser = async (req, res) => {
    try {
        const refreshToken = req.cookies[COOKIE_NAME_REFRESH];
        if (refreshToken) {
            await Session.deleteOne({ refreshToken });
        }
        res.clearCookie(COOKIE_NAME_ACCESS);
        res.clearCookie(COOKIE_NAME_REFRESH);
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const refreshToken = async (req, res) => {
    const refreshToken = req.cookies[COOKIE_NAME_REFRESH];
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

    try {
        const session = await Session.findOne({ refreshToken, isValid: true });
        if (!session) return res.status(401).json({ message: 'Invalid session' });

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret_key');
        
        // Idle timeout verification
        if (Date.now() - session.lastActivity.getTime() > MAX_IDLE_TIME) {
            await session.deleteOne();
            return res.status(401).json({ message: 'Session expired due to inactivity' });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.id);
        
        // Token Rotation: Replace old refresh token
        session.refreshToken = newRefreshToken;
        session.lastActivity = Date.now();
        await session.save();

        setCookies(res, accessToken, newRefreshToken);
        res.json({ message: 'Token refreshed' });
    } catch (error) {
        res.status(401).json({ message: 'Refresh token failed' });
    }
};

const getSupervisors = async (req, res) => {
    try {
        const supervisors = await User.find({ role: 'supervisor' }).select('-password');
        res.json(supervisors);
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, logoutUser, refreshToken, getSupervisors };
