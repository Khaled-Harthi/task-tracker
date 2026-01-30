import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, unauthorizedResponse } from '@/lib/auth';
import { z } from 'zod';

const addTagsSchema = z.object({
  tagIds: z.array(z.string().uuid('معرف العلامة غير صالح')),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorizedResponse();

    const { id: taskId } = await params;
    const body = await request.json();
    const parsed = addTagsSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: 'بيانات غير صالحة', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { tagIds } = parsed.data;

    // Verify task ownership
    const task = await prisma.task.findFirst({
      where: { id: taskId, project: { userId } },
    });

    if (!task) {
      return Response.json({ error: 'المهمة غير موجودة' }, { status: 404 });
    }

    // Verify all tags belong to user
    const tags = await prisma.tag.findMany({
      where: { id: { in: tagIds }, userId },
    });

    if (tags.length !== tagIds.length) {
      return Response.json({ error: 'بعض العلامات غير موجودة' }, { status: 400 });
    }

    // Create associations (ignore duplicates)
    await prisma.taskTag.createMany({
      data: tagIds.map((tagId) => ({ taskId, tagId })),
      skipDuplicates: true,
    });

    const updatedTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { select: { id: true, name: true, color: true } },
        tags: { include: { tag: true } },
      },
    });

    return Response.json({
      task: { ...updatedTask, tags: updatedTask!.tags.map((tt) => tt.tag) },
      message: 'تم إضافة العلامات بنجاح',
    });
  } catch (error) {
    console.error('Add tags error:', error);
    return Response.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
