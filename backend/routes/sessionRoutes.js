const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const requireSessionAuth = require('../middleware/sessionAuth');
const router = express.Router();


router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
       
        const [existing] = await db.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ 
                message: 'Username or email already taken' 
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
       
        const [result] = await db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        
        res.status(201).json({ 
            message: 'Registration successful! Please login.',
            userId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});


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
        
        // Store user in session
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email
        };
        
        res.json({ 
            message: 'Logged in successfully!',
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
});


router.get('/profile', requireSessionAuth, (req, res) => {
    res.json({ 
        user: req.session.user,
        authType: 'session'
    });
});


router.post('/logout', requireSessionAuth, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('sid');
        res.json({ message: 'Logged out successfully!' });
    });
});

module.exports = router;