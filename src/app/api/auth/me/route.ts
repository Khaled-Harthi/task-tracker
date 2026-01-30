import { prisma } from '@/lib/prisma';
import { getCurrentUserId, unauthorizedResponse } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorizedResponse();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      return Response.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    return Response.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return Response.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
