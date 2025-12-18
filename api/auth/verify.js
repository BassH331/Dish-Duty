const { kv } = require('@vercel/kv');
const { verifyToken, getTokenFromHeader, handleCors } = require('../../lib/auth');

module.exports = async function handler(req, res) {
    // Handle CORS
    if (handleCors(req, res)) return;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get token from Authorization header
        const token = getTokenFromHeader(req);

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Get user from KV store to ensure they still exist
        const userJson = await kv.hget('users', decoded.email);

        if (!userJson) {
            return res.status(401).json({ error: 'User not found' });
        }

        const user = typeof userJson === 'string' ? JSON.parse(userJson) : userJson;

        // Return user info (never return password)
        res.status(200).json({
            valid: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });

    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
