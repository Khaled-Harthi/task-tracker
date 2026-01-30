import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authMiddleware, generateToken } from '../middleware/auth.js';
import { validate, registerSchema, loginSchema } from '../middleware/validation.js';

const router = Router();
const prisma = new PrismaClient();

// Register
router.post('/register', validate(registerSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' }); // Email already in use
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true, createdAt: true }
    });

    // Generate token and set cookie
    const token = generateToken(user.id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({ user, message: 'تم إنشاء الحساب بنجاح' }); // Account created successfully
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' }); // Server error
  }
});

// Login
router.post('/login', validate(loginSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }); // Invalid email or password
      return;
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    // Generate token and set cookie
    const token = generateToken(user.id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      message: 'تم تسجيل الدخول بنجاح' // Logged in successfully
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// Logout
router.post('/logout', (_req: AuthRequest, res: Response): void => {
  res.clearCookie('token');
  res.json({ message: 'تم تسجيل الخروج بنجاح' }); // Logged out successfully
});

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, createdAt: true }
    });

    if (!user) {
      res.status(404).json({ error: 'المستخدم غير موجود' }); // User not found
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

export default router;
