import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, unauthorizedResponse } from '@/lib/auth';
import { z } from 'zod';

const createTagSchema = z.object({
  name: z.string().min(1, 'اسم العلامة مطلوب'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'لون غير صالح').optional(),
});

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorizedResponse();

    const tags = await prisma.tag.findMany({
      where: { userId },
      include: { _count: { select: { tasks: true } } },
      orderBy: { name: 'asc' },
    });

    return Response.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    return Response.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorizedResponse();

    const body = await request.json();
    const parsed = createTagSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: 'بيانات غير صالحة', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { name, color } = parsed.data;

    // Check if tag name already exists for this user
    const existing = await prisma.tag.findFirst({
      where: { name, userId },
    });

    if (existing) {
      return Response.json({ error: 'اسم العلامة موجود بالفعل' }, { status: 400 });
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color: color || '#FF6B6B',
        userId,
      },
    });

    return Response.json({ tag, message: 'تم إنشاء العلامة بنجاح' }, { status: 201 });
  } catch (error) {
    console.error('Create tag error:', error);
    return Response.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
