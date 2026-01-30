'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Badge, PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { cn, formatDate, isOverdue, isDueToday, getPriorityColor } from '@/lib/utils';
import { useConfetti } from '@/components/Confetti';
import type { Task } from '@/lib/api';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Trash2,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  locale: string;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onClick?: (task: Task) => void;
}

export function TaskCard({ task, locale, onComplete, onDelete, onClick }: TaskCardProps) {
  const t = useTranslations();
  const { fire: fireConfetti } = useConfetti();
  const [isDeleting, setIsDeleting] = useState(false);

  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [0, 100],
    ['rgba(239, 68, 68, 0)', 'rgba(239, 68, 68, 0.2)']
  );
  const deleteIconOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);

  const isTaskOverdue = task.dueDate && isOverdue(task.dueDate) && task.status !== 'done';
  const isTaskDueToday = task.dueDate && isDueToday(task.dueDate);
  const isCompleted = task.status === 'done';

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      setIsDeleting(true);
      onDelete(task.id);
    }
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCompleted) {
      fireConfetti();
    }
    onComplete(task.id);
  };

  const priorityColor = getPriorityColor(task.priority);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 200 }}
    >
      {/* Delete background indicator */}
      <motion.div
        className="absolute inset-0 rounded-xl flex items-center justify-end pe-6"
        style={{ background }}
      >
        <motion.div style={{ opacity: deleteIconOpacity }}>
          <Trash2 className="w-6 h-6 text-red-400" />
        </motion.div>
      </motion.div>

      {/* Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 150 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="cursor-grab active:cursor-grabbing"
      >
        <Card
          variant="default"
          hover
          glow={task.priority === 'urgent'}
          className={cn(
            'relative overflow-hidden',
            'border-s-4',
            isCompleted && 'opacity-60'
          )}
          style={{ borderInlineStartColor: priorityColor }}
          onClick={() => onClick?.(task)}
        >
          <div className="flex items-start gap-4">
            {/* Checkbox */}
            <button
              onClick={handleComplete}
              className={cn(
                'mt-0.5 shrink-0 transition-colors',
                isCompleted
                  ? 'text-emerald-500'
                  : 'text-text-muted hover:text-coral-500'
              )}
            >
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                >
                  <CheckCircle2 className="w-6 h-6" />
                </motion.div>
              ) : (
                <Circle className="w-6 h-6" />
              )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  'text-lg font-medium text-text-primary truncate',
                  isCompleted && 'line-through text-text-muted'
                )}
              >
                {task.title}
              </h3>

              {task.description && (
                <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Meta info */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {/* Project */}
                {task.project && (
                  <div className="flex items-center gap-1.5 text-sm text-text-muted">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: task.project.color }}
                    />
                    <span>{task.project.name}</span>
                  </div>
                )}

                {/* Due date */}
                {task.dueDate && (
                  <div
                    className={cn(
                      'flex items-center gap-1.5 text-sm',
                      isTaskOverdue
                        ? 'text-red-400'
                        : isTaskDueToday
                        ? 'text-amber-400'
                        : 'text-text-muted'
                    )}
                  >
                    {isTaskOverdue ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : isTaskDueToday ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                    <span>{formatDate(task.dueDate, locale)}</span>
                  </div>
                )}

                {/* Status */}
                <StatusBadge status={task.status} size="sm" />
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {task.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="tag"
                      color={tag.color}
                      size="sm"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Priority badge */}
            <PriorityBadge priority={task.priority} size="sm" />
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
