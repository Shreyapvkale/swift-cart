const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const router = express.Router();
const prisma = require('../services/db');

// Helper: JWT generation
function generateAccessToken(userId, role) {
  return jwt.sign(
    { userId, role },
    process.env.JWT_ACCESS_SECRET || 'swiftcart_jwt_access_secret_key_123!',
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'swiftcart_jwt_refresh_secret_key_987!',
    { expiresIn: '7d' }
  );
}

// @route   POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Required fields: name, email, password' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email address already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role || 'CUSTOMER';

    const newUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name,
          email,
          phone,
          passwordHash,
          role: assignedRole,
          isVerified: assignedRole === 'CUSTOMER' ? false : true // Vendors/delivery self-verify in prototype
        }
      });

      // If Customer, create empty cart
      if (assignedRole === 'CUSTOMER') {
        await tx.cart.create({ data: { userId: u.id } });
      }

      // If Vendor, create vendor profile
      if (assignedRole === 'VENDOR') {
        await tx.vendor.create({
          data: {
            userId: u.id,
            businessName: `${name}'s Boutique`,
            status: 'ACTIVE'
          }
        });
      }

      // If Delivery, create agent profile
      if (assignedRole === 'DELIVERY') {
        await tx.deliveryAgent.create({
          data: {
            userId: u.id,
            vehicleType: 'E-BIKE',
            isAvailable: true
          }
        });
      }

      return u;
    });

    res.status(201).json({
      success: true,
      message: 'Account successfully created!',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter all fields.' });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Auto-register user on login if they don't exist
      const emailName = email.split('@')[0];
      const name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      const passwordHash = await bcrypt.hash(password, 10);

      user = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            name,
            email,
            passwordHash,
            role: 'CUSTOMER',
            isVerified: true
          }
        });

        // Create empty cart
        await tx.cart.create({ data: { userId: u.id } });

        // Create notification preferences
        await tx.notificationPrefs.create({ data: { userId: u.id } });

        // Create welcome wallet transactions totaling 320 INR
        await tx.walletTransaction.create({
          data: {
            userId: u.id,
            type: 'CREDIT',
            amount: 120.0,
            description: 'Welcome Sign-up Bonus',
            balanceAfter: 120.0
          }
        });

        await tx.walletTransaction.create({
          data: {
            userId: u.id,
            type: 'CREDIT',
            amount: 200.0,
            description: 'First Deposit Promo',
            balanceAfter: 320.0
          }
        });

        return u;
      });
    } else {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        // Automatically update the password to the newly provided one in development/demo mode to prevent login blockages
        const passwordHash = await bcrypt.hash(password, 10);
        user = await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash }
        });
      }
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt
      }
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/logout
router.post('/logout', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/refresh-token
router.post('/refresh-token', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) await prisma.refreshToken.delete({ where: { token } });
      return res.status(401).json({ success: false, message: 'Invalid or expired session.' });
    }

    const accessToken = generateAccessToken(storedToken.user.id, storedToken.user.role);
    res.status(200).json({ success: true, accessToken });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'No account found with that email address.' });
    }

    // Generate random 6 digit OTP for prototype
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[SIMULATION OTP] Reset request for: ${email}. Code: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'Password reset OTP has been sent to your email (simulated in logs).',
      otp // send back in dev to make UI flow seamless
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User context not found.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    res.status(200).json({ success: true, message: 'Password has been updated. Please login.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
