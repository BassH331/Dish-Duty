const { kv } = require('@vercel/kv');
const { verifyToken, getTokenFromHeader, handleCors, sanitizeInput } = require('../../lib/auth');

module.exports = async function handler(req, res) {
    // Handle CORS
    if (handleCors(req, res)) return;

    if (req.method !== 'POST') {
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

        const { people, startDate } = req.body;

        // Validate inputs
        if (!Array.isArray(people)) {
            return res.status(400).json({ error: 'People must be an array' });
        }

        // Sanitize people names (max 20 people, max 50 chars each)
        const sanitizedPeople = people
            .slice(0, 20)
            .map(name => sanitizeInput(name).slice(0, 50))
            .filter(name => name.length > 0);

        // Validate start date format
        let sanitizedStartDate = null;
        if (startDate) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(startDate)) {
                sanitizedStartDate = startDate;
            }
        }

        // Create schedule object
        const schedule = {
            people: sanitizedPeople,
            startDate: sanitizedStartDate,
            updatedAt: new Date().toISOString()
        };

        // Save to KV store
        await kv.hset('schedules', { [decoded.userId]: JSON.stringify(schedule) });

        res.status(200).json({
            message: 'Schedule saved successfully',
            schedule: {
                people: sanitizedPeople,
                startDate: sanitizedStartDate
            }
        });

    } catch (error) {
        console.error('Save schedule error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
