import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId, unauthorizedResponse } from '@/lib/auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const createTaskSchema = z.object({
  title: z.string().min(1, 'عنوان المهمة مطلوب'),
  description: z.string().optional(),
  projectId: z.string().uuid('معرف المشروع غير صالح'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

function buildTaskFilters(searchParams: URLSearchParams, userId: string): Prisma.TaskWhereInput {
  const filters: Prisma.TaskWhereInput = {
    project: { userId },
  };

  const projectId = searchParams.get('projectId');
  if (projectId) filters.projectId = projectId;

  const status = searchParams.get('status');
  if (status) {
    const statuses = status.split(',').filter(Boolean);
    if (statuses.length > 0) {
      filters.status = { in: statuses as Prisma.EnumTaskStatusFilter['in'] };
    }
  }

  const priority = searchParams.get('priority');
  if (priority) {
    const priorities = priority.split(',').filter(Boolean);
    if (priorities.length > 0) {
      filters.priority = { in: priorities as Prisma.EnumPriorityFilter['in'] };
    }
  }

  const tags = searchParams.get('tags');
  if (tags) {
    const tagIds = tags.split(',').filter(Boolean);
    if (tagIds.length > 0) {
      filters.AND = tagIds.map((tagId) => ({
        tags: { some: { tagId } },
      }));
    }
  }

  const search = searchParams.get('search');
  if (search) {
    filters.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (searchParams.get('overdue') === 'true') {
    filters.dueDate = { lt: new Date() };
    filters.status = { not: 'done' };
  }

  if (searchParams.get('dueToday') === 'true') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    filters.dueDate = { gte: today, lt: tomorrow };
  }

  return filters;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorizedResponse();

    const filters = buildTaskFilters(request.nextUrl.searchParams, userId);

    const tasks = await prisma.task.findMany({
      where: filters,
      include: {
        project: { select: { id: true, name: true, color: true } },
        tags: { include: { tag: true } },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    const transformedTasks = tasks.map((task) => ({
      ...task,
      tags: task.tags.map((tt) => tt.tag),
    }));

    return Response.json({ tasks: transformedTasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return Response.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return unauthorizedResponse();

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: 'بيانات غير صالحة', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { title, description, projectId, priority, status, dueDate } = parsed.data;

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return Response.json({ error: 'المشروع غير موجود' }, { status: 404 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        priority: priority || 'medium',
        status: status || 'todo',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
        tags: { include: { tag: true } },
      },
    });

    return Response.json(
      { task: { ...task, tags: task.tags.map((tt) => tt.tag) }, message: 'تم إنشاء المهمة بنجاح' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create task error:', error);
    return Response.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
