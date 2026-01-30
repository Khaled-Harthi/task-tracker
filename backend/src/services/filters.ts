import { Prisma } from '@prisma/client';
import { ParsedQs } from 'qs';

interface TaskFilters {
  projectId?: string;
  tagIds?: string[];
  status?: string[];
  priority?: string[];
  dueBefore?: string;
  dueAfter?: string;
  search?: string;
}

export function buildTaskFilters(
  query: ParsedQs,
  userId: string
): Prisma.TaskWhereInput {
  const filters: Prisma.TaskWhereInput = {
    project: { userId }
  };

  // Filter by project
  if (query.projectId && typeof query.projectId === 'string') {
    filters.projectId = query.projectId;
  }

  // Filter by status (comma-separated)
  if (query.status && typeof query.status === 'string') {
    const statuses = query.status.split(',').filter(Boolean);
    if (statuses.length > 0) {
      filters.status = { in: statuses as Prisma.EnumTaskStatusFilter['in'] };
    }
  }

  // Filter by priority (comma-separated)
  if (query.priority && typeof query.priority === 'string') {
    const priorities = query.priority.split(',').filter(Boolean);
    if (priorities.length > 0) {
      filters.priority = { in: priorities as Prisma.EnumPriorityFilter['in'] };
    }
  }

  // Filter by tags (comma-separated, uses AND logic - task must have all tags)
  if (query.tags && typeof query.tags === 'string') {
    const tagIds = query.tags.split(',').filter(Boolean);
    if (tagIds.length > 0) {
      filters.AND = tagIds.map(tagId => ({
        tags: { some: { tagId } }
      }));
    }
  }

  // Filter by due date range
  if (query.dueBefore && typeof query.dueBefore === 'string') {
    try {
      const date = new Date(query.dueBefore);
      filters.dueDate = { ...((filters.dueDate as Prisma.DateTimeNullableFilter) || {}), lte: date };
    } catch {
      // Invalid date, ignore
    }
  }

  if (query.dueAfter && typeof query.dueAfter === 'string') {
    try {
      const date = new Date(query.dueAfter);
      filters.dueDate = { ...((filters.dueDate as Prisma.DateTimeNullableFilter) || {}), gte: date };
    } catch {
      // Invalid date, ignore
    }
  }

  // Filter overdue tasks
  if (query.overdue === 'true') {
    filters.dueDate = { lt: new Date() };
    filters.status = { not: 'done' };
  }

  // Filter tasks due today
  if (query.dueToday === 'true') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    filters.dueDate = { gte: today, lt: tomorrow };
  }

  // Search in title and description
  if (query.search && typeof query.search === 'string') {
    const searchTerm = query.search.trim();
    if (searchTerm) {
      filters.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }
  }

  return filters;
}
