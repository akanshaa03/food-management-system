const logger = require('../utils/logger');

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...String} allowedRoles Permitted roles for the route (e.g. 'BUSINESS', 'NGO', 'SUPER_ADMIN')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. User identity or role missing.',
      });
    }

    const userRole = req.user.role.toUpperCase();

    // SUPER_ADMIN has override permission to access any module
    if (userRole === 'SUPER_ADMIN') {
      return next();
    }

    // Check if user's role matches permitted roles
    const normalizedAllowedRoles = allowedRoles.map((r) => r.toUpperCase());
    const isAuthorized = normalizedAllowedRoles.includes(userRole);

    if (!isAuthorized) {
      logger.warn(`Access Denied: User ID ${req.user.id} [Role: ${userRole}] attempted access to restricted endpoint requiring [${normalizedAllowedRoles.join(', ')}]`);
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${userRole}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

module.exports = { authorize };
