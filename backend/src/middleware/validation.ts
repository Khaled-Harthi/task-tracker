import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'بيانات غير صالحة', // Invalid data
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
        return;
      }
      next(error);
    }
  };
}

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  name: z.string().min(1, 'الاسم مطلوب')
});

export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة')
});

// Project schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'اسم المشروع مطلوب'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'لون غير صالح').optional()
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'لون غير صالح').optional()
});

// Task schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'عنوان المهمة مطلوب'),
  description: z.string().optional(),
  projectId: z.string().uuid('معرف المشروع غير صالح'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  dueDate: z.string().datetime().optional().nullable()
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  projectId: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  dueDate: z.string().datetime().optional().nullable()
});

// Tag schemas
export const createTagSchema = z.object({
  name: z.string().min(1, 'اسم العلامة مطلوب'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'لون غير صالح').optional()
});

export const updateTagSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'لون غير صالح').optional()
});

// Task-Tag association
export const addTagsToTaskSchema = z.object({
  tagIds: z.array(z.string().uuid('معرف العلامة غير صالح'))
});
