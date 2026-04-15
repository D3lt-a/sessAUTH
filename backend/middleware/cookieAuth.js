const cookieSessions = new Map();

function requireCookieAuth(req, res, next) {
    const token = req.signedCookies.authToken;
    
    if (!token) {
        return res.status(401).json({ 
            message: 'Missing authentication cookie' 
        });
    }
    
    const user = cookieSessions.get(token);
    
    if (!user) {
        return res.status(401).json({ 
            message: 'Invalid or expired session' 
        });
    }
    
    req.user = user;
    next();
}

module.exports = { requireCookieAuth, cookieSessions };