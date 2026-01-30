import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, unauthorizedResponse } from '@/lib/auth';
import { z } from 'zod';

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'لون غير صالح').optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorizedResponse();

    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: { id, userId },
      include: {
        tasks: {
          include: { tags: { include: { tag: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { tasks: true } },
      },
    });

    if (!project) {
      return Response.json({ error: 'المشروع غير موجود' }, { status: 404 });
    }

    return Response.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    return Response.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: 'بيانات غير صالحة', details: parsed.error.errors },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return Response.json({ error: 'المشروع غير موجود' }, { status: 404 });
    }

    const project = await prisma.project.update({
      where: { id },
      data: parsed.data,
    });

    return Response.json({ project, message: 'تم تحديث المشروع بنجاح' });
  } catch (error) {
    console.error('Update project error:', error);
    return Response.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorizedResponse();

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return Response.json({ error: 'المشروع غير موجود' }, { status: 404 });
    }

    await prisma.project.delete({ where: { id } });

    return Response.json({ message: 'تم حذف المشروع بنجاح' });
  } catch (error) {
    console.error('Delete project error:', error);
    return Response.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
