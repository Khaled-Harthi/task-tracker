import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, unauthorizedResponse } from '@/lib/auth';
import { z } from 'zod';

const updateTagSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'لون غير صالح').optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateTagSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: 'بيانات غير صالحة', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const existing = await prisma.tag.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return Response.json({ error: 'العلامة غير موجودة' }, { status: 404 });
    }

    // Check if new name conflicts with another tag
    if (parsed.data.name && parsed.data.name !== existing.name) {
      const nameConflict = await prisma.tag.findFirst({
        where: {
          name: parsed.data.name,
          userId,
          id: { not: id },
        },
      });

      if (nameConflict) {
        return Response.json({ error: 'اسم العلامة موجود بالفعل' }, { status: 400 });
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: parsed.data,
    });

    return Response.json({ tag, message: 'تم تحديث العلامة بنجاح' });
  } catch (error) {
    console.error('Update tag error:', error);
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

    const existing = await prisma.tag.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return Response.json({ error: 'العلامة غير موجودة' }, { status: 404 });
    }

    await prisma.tag.delete({ where: { id } });

    return Response.json({ message: 'تم حذف العلامة بنجاح' });
  } catch (error) {
    console.error('Delete tag error:', error);
    return Response.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
