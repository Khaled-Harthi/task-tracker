import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, unauthorizedResponse } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorizedResponse();

    const { id: taskId, tagId } = await params;

    // Verify task ownership
    const task = await prisma.task.findFirst({
      where: { id: taskId, project: { userId } },
    });

    if (!task) {
      return Response.json({ error: 'المهمة غير موجودة' }, { status: 404 });
    }

    await prisma.taskTag
      .delete({
        where: { taskId_tagId: { taskId, tagId } },
      })
      .catch(() => {
        // Ignore if not exists
      });

    return Response.json({ message: 'تم إزالة العلامة بنجاح' });
  } catch (error) {
    console.error('Remove tag error:', error);
    return Response.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
