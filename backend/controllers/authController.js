const User = require('../models/User');
const Session = require('../models/Session');
const RangeAssignment = require('../models/RangeAssignment');
const { isIdentifierInRange } = require('../utils/rangeHelper');
const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_EXPIRY = '15m'; // 15 mins
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
const MAX_IDLE_TIME = 30 * 60 * 1000; // 30 mins idle

const generateTokens = (id) => {
    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret_key', { expiresIn: REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken };
};

const registerUser = async (req, res) => {
    const { role, identifier, name, password, supervisorId } = req.body;

    try {
        const userExists = await User.findOne({ identifier });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const userObj = { role, identifier, name, password };
        
        // Automatic Assignment Logic
        if (role === 'student' && !supervisorId) {
            const ranges = await RangeAssignment.find({});
            for (const range of ranges) {
                if (isIdentifierInRange(identifier, range)) {
                    userObj.supervisor = range.supervisor;
                    break;
                }
            }
        } else if (role === 'student' && supervisorId) {
            userObj.supervisor = supervisorId;
        }

        const user = await User.create(userObj);
        if (user) {
            const { accessToken, refreshToken } = generateTokens(user._id);
            
            await Session.create({
                userId: user._id, 
                refreshToken, 
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip
            });

            res.status(201).json({
                _id: user._id,
                identifier: user.identifier,
                name: user.name,
                role: user.role,
                supervisor: user.supervisor,
                accessToken,
                refreshToken
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
            
            await Session.create({
                userId: user._id, 
                refreshToken, 
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip
            });

            res.json({
                _id: user._id,
                identifier: user.identifier,
                name: user.name,
                role: user.role,
                supervisor: user.supervisor,
                accessToken,
                refreshToken
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
        const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
        if (refreshToken) {
            await Session.deleteOne({ refreshToken });
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const refreshToken = async (req, res) => {
    const oldRefreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
    if (!oldRefreshToken) return res.status(401).json({ message: 'No refresh token' });

    try {
        const session = await Session.findOne({ refreshToken: oldRefreshToken, isValid: true });
        if (!session) return res.status(401).json({ message: 'Invalid session' });

        const decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret_key');
        
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

        res.json({ accessToken, refreshToken: newRefreshToken });
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
