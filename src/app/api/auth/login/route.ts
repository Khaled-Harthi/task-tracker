import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: 'بيانات غير صالحة', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return Response.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // Generate token and set cookie
    const token = generateToken(user.id);
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return Response.json({
      user: { id: user.id, email: user.email, name: user.name },
      message: 'تم تسجيل الدخول بنجاح',
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
