import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  name: z.string().min(1, 'الاسم مطلوب'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: 'بيانات غير صالحة', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return Response.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    // Generate token and set cookie
    const token = generateToken(user.id);
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return Response.json(
      { user, message: 'تم إنشاء الحساب بنجاح' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return Response.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
