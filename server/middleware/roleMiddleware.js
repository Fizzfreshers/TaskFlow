const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

const teamLeaderOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'team-leader' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a team leader or admin' });
    }
};

module.exports = { admin, teamLeaderOrAdmin };