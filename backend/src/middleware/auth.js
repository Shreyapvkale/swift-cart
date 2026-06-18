const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(418).json({
        success: false,
        message: 'Access Denied: No credentials provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'swiftcart_jwt_access_secret_key_123!');

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: Invalid user account context.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth verification failure:', error.message);
    let message = 'Access Denied: Invalid signature token.';
    if (error.name === 'TokenExpiredError') {
      message = 'Access Denied: Authentication token expired.';
    }

    return res.status(401).json({
      success: false,
      message
    });
  }
}

module.exports = authenticate;
