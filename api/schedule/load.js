const { kv } = require('@vercel/kv');
const { verifyToken, getTokenFromHeader, handleCors } = require('../../lib/auth');

module.exports = async function handler(req, res) {
    // Handle CORS
    if (handleCors(req, res)) return;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get and verify token
        const token = getTokenFromHeader(req);

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Get schedule from KV store
        const scheduleJson = await kv.hget('schedules', decoded.userId);

        if (!scheduleJson) {
            // Return empty schedule for new users
            return res.status(200).json({
                schedule: {
                    people: [],
                    startDate: null
                }
            });
        }

        const schedule = typeof scheduleJson === 'string' ? JSON.parse(scheduleJson) : scheduleJson;

        res.status(200).json({
            schedule: {
                people: schedule.people || [],
                startDate: schedule.startDate || null
            }
        });

    } catch (error) {
        console.error('Load schedule error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
