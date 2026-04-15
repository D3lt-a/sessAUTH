require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const sessionRoutes = require('./routes/sessionRoutes');
const cookieRoutes = require('./routes/cookieRoutes');
const tokenRoutes = require('./routes/tokenRoutes');

const app = express();


app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));


app.use(session({
    name: 'sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 
    }
}));


app.use('/api/session', sessionRoutes);
app.use('/api/cookie', cookieRoutes);
app.use('/api/token', tokenRoutes);


app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Session auth: http://localhost:${PORT}/api/session`);
    console.log(`Cookie auth: http://localhost:${PORT}/api/cookie`);
    console.log(`Token auth: http://localhost:${PORT}/api/token`);
});