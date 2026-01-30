import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorizedResponse();

    const { taskIds, status, projectId } = await request.json();

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return Response.json({ error: 'يرجى تحديد المهام' }, { status: 400 });
    }

    // Verify all tasks belong to user
    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds }, project: { userId } },
    });

    if (tasks.length !== taskIds.length) {
      return Response.json({ error: 'بعض المهام غير موجودة' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;

    if (projectId) {
      // Verify project ownership
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
      });
      if (!project) {
        return Response.json({ error: 'المشروع غير موجود' }, { status: 404 });
      }
      updateData.projectId = projectId;
    }

    await prisma.task.updateMany({
      where: { id: { in: taskIds } },
      data: updateData,
    });

    return Response.json({ message: 'تم تحديث المهام بنجاح', count: taskIds.length });
  } catch (error) {
    console.error('Bulk update error:', error);
    return Response.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
