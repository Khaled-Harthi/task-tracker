import { Router, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { validate, createTaskSchema, updateTaskSchema, addTagsToTaskSchema } from '../middleware/validation.js';
import { buildTaskFilters } from '../services/filters.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Get all tasks with complex filtering
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filters = buildTaskFilters(req.query, req.userId!);

    const tasks = await prisma.task.findMany({
      where: filters,
      include: {
        project: { select: { id: true, name: true, color: true } },
        tags: { include: { tag: true } }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Transform tags for cleaner response
    const transformedTasks = tasks.map(task => ({
      ...task,
      tags: task.tags.map(tt => tt.tag)
    }));

    res.json({ tasks: transformedTasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// Get single task
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        project: { userId: req.userId }
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
        tags: { include: { tag: true } }
      }
    });

    if (!task) {
      res.status(404).json({ error: 'المهمة غير موجودة' }); // Task not found
      return;
    }

    res.json({
      task: {
        ...task,
        tags: task.tags.map(tt => tt.tag)
      }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// Create task
router.post('/', validate(createTaskSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, projectId, priority, status, dueDate } = req.body;

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId }
    });

    if (!project) {
      res.status(404).json({ error: 'المشروع غير موجود' });
      return;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        priority: priority || 'medium',
        status: status || 'todo',
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
        tags: { include: { tag: true } }
      }
    });

    res.status(201).json({
      task: { ...task, tags: task.tags.map(tt => tt.tag) },
      message: 'تم إنشاء المهمة بنجاح' // Task created successfully
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// Update task
router.patch('/:id', validate(updateTaskSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Verify task ownership
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, project: { userId: req.userId } }
    });

    if (!existing) {
      res.status(404).json({ error: 'المهمة غير موجودة' });
      return;
    }

    // If changing project, verify new project ownership
    if (req.body.projectId) {
      const project = await prisma.project.findFirst({
        where: { id: req.body.projectId, userId: req.userId }
      });
      if (!project) {
        res.status(404).json({ error: 'المشروع غير موجود' });
        return;
      }
    }

    const updateData: Prisma.TaskUpdateInput = { ...req.body };
    if (req.body.dueDate !== undefined) {
      updateData.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, color: true } },
        tags: { include: { tag: true } }
      }
    });

    res.json({
      task: { ...task, tags: task.tags.map(tt => tt.tag) },
      message: 'تم تحديث المهمة بنجاح' // Task updated successfully
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// Delete task
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, project: { userId: req.userId } }
    });

    if (!existing) {
      res.status(404).json({ error: 'المهمة غير موجودة' });
      return;
    }

    await prisma.task.delete({ where: { id: req.params.id } });

    res.json({ message: 'تم حذف المهمة بنجاح' }); // Task deleted successfully
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// Add tags to task
router.post('/:id/tags', validate(addTagsToTaskSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tagIds } = req.body;

    // Verify task ownership
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, project: { userId: req.userId } }
    });

    if (!task) {
      res.status(404).json({ error: 'المهمة غير موجودة' });
      return;
    }

    // Verify all tags belong to user
    const tags = await prisma.tag.findMany({
      where: { id: { in: tagIds }, userId: req.userId }
    });

    if (tags.length !== tagIds.length) {
      res.status(400).json({ error: 'بعض العلامات غير موجودة' }); // Some tags not found
      return;
    }

    // Create associations (ignore duplicates)
    await prisma.taskTag.createMany({
      data: tagIds.map((tagId: string) => ({ taskId: req.params.id, tagId })),
      skipDuplicates: true
    });

    const updatedTask = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        project: { select: { id: true, name: true, color: true } },
        tags: { include: { tag: true } }
      }
    });

    res.json({
      task: { ...updatedTask, tags: updatedTask!.tags.map(tt => tt.tag) },
      message: 'تم إضافة العلامات بنجاح' // Tags added successfully
    });
  } catch (error) {
    console.error('Add tags error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// Remove tag from task
router.delete('/:id/tags/:tagId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Verify task ownership
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, project: { userId: req.userId } }
    });

    if (!task) {
      res.status(404).json({ error: 'المهمة غير موجودة' });
      return;
    }

    await prisma.taskTag.delete({
      where: {
        taskId_tagId: { taskId: req.params.id, tagId: req.params.tagId }
      }
    }).catch(() => {
      // Ignore if not exists
    });

    res.json({ message: 'تم إزالة العلامة بنجاح' }); // Tag removed successfully
  } catch (error) {
    console.error('Remove tag error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// Bulk update tasks (mark multiple as done, move to project)
router.post('/bulk', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskIds, status, projectId } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      res.status(400).json({ error: 'يرجى تحديد المهام' }); // Please select tasks
      return;
    }

    // Verify all tasks belong to user
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
        project: { userId: req.userId }
      }
    });

    if (tasks.length !== taskIds.length) {
      res.status(400).json({ error: 'بعض المهام غير موجودة' }); // Some tasks not found
      return;
    }

    const updateData: Prisma.TaskUpdateManyMutationInput = {};
    if (status) updateData.status = status;
    if (projectId) {
      // Verify project ownership
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId: req.userId }
      });
      if (!project) {
        res.status(404).json({ error: 'المشروع غير موجود' });
        return;
      }
    }

    await prisma.task.updateMany({
      where: { id: { in: taskIds } },
      data: projectId ? { ...updateData, projectId } : updateData
    });

    res.json({ message: 'تم تحديث المهام بنجاح', count: taskIds.length }); // Tasks updated successfully
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

export default router;
