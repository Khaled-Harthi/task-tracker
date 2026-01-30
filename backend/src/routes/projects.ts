import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { validate, createProjectSchema, updateProjectSchema } from '../middleware/validation.js';

const router = Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all projects for current user
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
      include: {
        _count: { select: { tasks: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// Get single project
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        tasks: {
          include: { tags: { include: { tag: true } } },
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { tasks: true } }
      }
    });

    if (!project) {
      res.status(404).json({ error: 'المشروع غير موجود' }); // Project not found
      return;
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// Create project
router.post('/', validate(createProjectSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, color } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color: color || '#FF6B6B',
        userId: req.userId!
      }
    });

    res.status(201).json({ project, message: 'تم إنشاء المشروع بنجاح' }); // Project created successfully
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// Update project
router.patch('/:id', validate(updateProjectSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!existing) {
      res.status(404).json({ error: 'المشروع غير موجود' });
      return;
    }

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({ project, message: 'تم تحديث المشروع بنجاح' }); // Project updated successfully
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// Delete project
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!existing) {
      res.status(404).json({ error: 'المشروع غير موجود' });
      return;
    }

    await prisma.project.delete({ where: { id: req.params.id } });

    res.json({ message: 'تم حذف المشروع بنجاح' }); // Project deleted successfully
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

export default router;
