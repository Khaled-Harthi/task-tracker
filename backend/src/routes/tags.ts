import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { validate, createTagSchema, updateTagSchema } from '../middleware/validation.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Get all tags for current user
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tags = await prisma.tag.findMany({
      where: { userId: req.userId },
      include: {
        _count: { select: { tasks: true } }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// Create tag
router.post('/', validate(createTagSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, color } = req.body;

    // Check if tag name already exists for this user
    const existing = await prisma.tag.findFirst({
      where: { name, userId: req.userId }
    });

    if (existing) {
      res.status(400).json({ error: 'اسم العلامة موجود بالفعل' }); // Tag name already exists
      return;
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color: color || '#FF6B6B',
        userId: req.userId!
      }
    });

    res.status(201).json({ tag, message: 'تم إنشاء العلامة بنجاح' }); // Tag created successfully
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// Update tag
router.patch('/:id', validate(updateTagSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.tag.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!existing) {
      res.status(404).json({ error: 'العلامة غير موجودة' }); // Tag not found
      return;
    }

    // Check if new name conflicts with another tag
    if (req.body.name && req.body.name !== existing.name) {
      const nameConflict = await prisma.tag.findFirst({
        where: {
          name: req.body.name,
          userId: req.userId,
          id: { not: req.params.id }
        }
      });

      if (nameConflict) {
        res.status(400).json({ error: 'اسم العلامة موجود بالفعل' });
        return;
      }
    }

    const tag = await prisma.tag.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({ tag, message: 'تم تحديث العلامة بنجاح' }); // Tag updated successfully
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// Delete tag
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.tag.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!existing) {
      res.status(404).json({ error: 'العلامة غير موجودة' });
      return;
    }

    await prisma.tag.delete({ where: { id: req.params.id } });

    res.json({ message: 'تم حذف العلامة بنجاح' }); // Tag deleted successfully
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

export default router;
