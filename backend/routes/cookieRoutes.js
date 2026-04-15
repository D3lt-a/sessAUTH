const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { requireCookieAuth, cookieSessions } = require('../middleware/cookieAuth');
const router = express.Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const [users] = await db.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const authToken = crypto.randomBytes(32).toString('hex');
        
        
        cookieSessions.set(authToken, {
            id: user.id,
            username: user.username,
            email: user.email
        });
        
      
        res.cookie('authToken', authToken, {
            httpOnly: true,
            signed: true,
            sameSite: 'lax',
            secure: false, 
            maxAge: 1000 * 60 * 60
        });
        
        res.json({ 
            message: 'Logged in with cookie authentication!',
            user: { id: user.id, username: user.username }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/profile', requireCookieAuth, (req, res) => {
    res.json({ 
        user: req.user,
        authType: 'signed-cookie'
    });
});


router.post('/logout', requireCookieAuth, (req, res) => {
    const token = req.signedCookies.authToken;
    cookieSessions.delete(token);
    res.clearCookie('authToken');
    res.json({ message: 'Logged out successfully!' });
});

module.exports = router;