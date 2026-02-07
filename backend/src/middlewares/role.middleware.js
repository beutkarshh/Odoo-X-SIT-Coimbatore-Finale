

/**
 * Middleware factory to restrict access by role.
 * Assumes `authenticateToken` already ran and set `req.user`.
 *
 * Usage: router.get('/admin-only', authenticateToken, authorizeRoles('ADMIN'), handler)
 */
function authorizeRoles(...allowedRoles) {
	return function roleGuard(req, res, next) {
		const role = req?.user?.role;
		if (!role) {
			return res.status(401).json({ success: false, message: 'Unauthorized' });
		}

		if (!allowedRoles.includes(role)) {
			return res.status(403).json({ success: false, message: 'Forbidden' });
		}

		return next();
	};
}

module.exports = { authorizeRoles };

