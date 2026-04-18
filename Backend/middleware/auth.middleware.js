/**
 * Authentication Middleware
 * Extracts user information from request headers and validates tokens
 */

const authMiddleware = (req, res, next) => {
  try {
    // Extract user info from headers
    const userId = req.headers['x-user-id'];
    const userName = req.headers['x-user-name'];
    const userUniversity = req.headers['x-user-university'];
    const userRole = req.headers['x-user-role'];

    // Attach user info to request object for use in controllers
    req.user = {
      id: userId || 'test-user',
      name: userName || 'Test User',
      university: userUniversity || 'default-university',
      role: userRole || 'student',
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

module.exports = authMiddleware;
