const { kv } = require('@vercel/kv');
const bcrypt = require('bcryptjs');
const { createToken, handleCors, sanitizeInput, isValidEmail } = require('../../lib/auth');

module.exports = async function handler(req, res) {
    // Handle CORS
    if (handleCors(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        // Validate inputs
        const sanitizedEmail = sanitizeInput(email).toLowerCase();

        if (!sanitizedEmail || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (!isValidEmail(sanitizedEmail)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Get user from KV store
        const userJson = await kv.hget('users', sanitizedEmail);

        if (!userJson) {
            // Use generic message to prevent email enumeration
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = typeof userJson === 'string' ? JSON.parse(userJson) : userJson;

        // Compare passwords using bcrypt (timing-safe comparison)
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create JWT token
        const token = createToken(user.id, user.email);

        // Return success (never return password)
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
