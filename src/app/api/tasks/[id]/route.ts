import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, unauthorizedResponse } from '@/lib/auth';
import { z } from 'zod';

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  projectId: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorizedResponse();

    const { id } = await params;

    const task = await prisma.task.findFirst({
      where: { id, project: { userId } },
      include: {
        project: { select: { id: true, name: true, color: true } },
        tags: { include: { tag: true } },
      },
    });

    if (!task) {
      return Response.json({ error: 'المهمة غير موجودة' }, { status: 404 });
    }

    return Response.json({
      task: { ...task, tags: task.tags.map((tt) => tt.tag) },
    });
  } catch (error) {
    console.error('Get task error:', error);
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
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: 'بيانات غير صالحة', details: parsed.error.errors },
        { status: 400 }
      );
    }

    // Verify task ownership
    const existing = await prisma.task.findFirst({
      where: { id, project: { userId } },
    });

    if (!existing) {
      return Response.json({ error: 'المهمة غير موجودة' }, { status: 404 });
    }

    // If changing project, verify new project ownership
    if (parsed.data.projectId) {
      const project = await prisma.project.findFirst({
        where: { id: parsed.data.projectId, userId },
      });
      if (!project) {
        return Response.json({ error: 'المشروع غير موجود' }, { status: 404 });
      }
    }

    const updateData = { ...parsed.data };
    if (parsed.data.dueDate !== undefined) {
      (updateData as Record<string, unknown>).dueDate = parsed.data.dueDate
        ? new Date(parsed.data.dueDate)
        : null;
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, color: true } },
        tags: { include: { tag: true } },
      },
    });

    return Response.json({
      task: { ...task, tags: task.tags.map((tt) => tt.tag) },
      message: 'تم تحديث المهمة بنجاح',
    });
  } catch (error) {
    console.error('Update task error:', error);
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

    const existing = await prisma.task.findFirst({
      where: { id, project: { userId } },
    });

    if (!existing) {
      return Response.json({ error: 'المهمة غير موجودة' }, { status: 404 });
    }

    await prisma.task.delete({ where: { id } });

    return Response.json({ message: 'تم حذف المهمة بنجاح' });
  } catch (error) {
    console.error('Delete task error:', error);
    return Response.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
