import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, unauthorizedResponse } from '@/lib/auth';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1, 'اسم المشروع مطلوب'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'لون غير صالح').optional(),
});

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorizedResponse();

    const projects = await prisma.project.findMany({
      where: { userId },
      include: { _count: { select: { tasks: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return Response.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorizedResponse();

    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: 'بيانات غير صالحة', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { name, description, color } = parsed.data;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color: color || '#FF6B6B',
        userId,
      },
    });

    return Response.json(
      { project, message: 'تم إنشاء المشروع بنجاح' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create project error:', error);
    return Response.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
