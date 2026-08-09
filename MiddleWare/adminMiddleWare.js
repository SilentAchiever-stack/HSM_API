const isAdmin = async (req, res, next) => {
    try {
        const allowedRoles = ['admin','receptionist'];

        if (req.user && allowedRoles.includes(req.user.role)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Access Denied. Unauthorized role.'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error in admin middleware.'
        });
    }
};
module.exports = isAdmin;