function requireSessionAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ 
            message: 'Not authenticated - please login first' 
        });
    }
    next();
}

module.exports = requireSessionAuth;