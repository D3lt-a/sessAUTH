const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const requireTokenAuth = require('../middleware/tokenAuth');
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
        
      
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                email: user.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        res.json({ 
            message: 'Logged in with JWT!',
            token: token,
            user: { id: user.id, username: user.username }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/profile', requireTokenAuth, (req, res) => {
    res.json({ 
        user: req.user,
        authType: 'jwt-token'
    });
});


router.post('/verify', (req, res) => {
    const token = req.body.token;
    
    if (!token) {
        return res.status(400).json({ valid: false, message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.json({ valid: false, message: error.message });
    }
});

module.exports = router;