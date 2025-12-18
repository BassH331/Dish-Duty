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
        const { email, password, name } = req.body;

        // Validate inputs
        const sanitizedEmail = sanitizeInput(email).toLowerCase();
        const sanitizedName = sanitizeInput(name);

        if (!sanitizedEmail || !password || !sanitizedName) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }

        if (!isValidEmail(sanitizedEmail)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        if (sanitizedName.length < 2) {
            return res.status(400).json({ error: 'Name must be at least 2 characters' });
        }

        // Check if user already exists
        const existingUser = await kv.hget('users', sanitizedEmail);
        if (existingUser) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }

        // Hash password with bcrypt (10 rounds)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user object
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const user = {
            id: userId,
            email: sanitizedEmail,
            name: sanitizedName,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        // Store user in KV
        await kv.hset('users', { [sanitizedEmail]: JSON.stringify(user) });

        // Initialize empty schedule for user
        await kv.hset('schedules', { [userId]: JSON.stringify({ people: [], startDate: null }) });

        // Create JWT token
        const token = createToken(userId, sanitizedEmail);

        // Return success (never return password)
        res.status(201).json({
            message: 'Account created successfully',
            user: {
                id: userId,
                email: sanitizedEmail,
                name: sanitizedName
            },
            token
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
