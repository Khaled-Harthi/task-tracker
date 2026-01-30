'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { TaskCard } from '@/components/TaskCard';
import { staggerContainerVariants } from '@/lib/motion';
import type { Task } from '@/lib/api';
import { ClipboardList } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  locale: string;
  onCompleteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onTaskClick?: (task: Task) => void;
  loading?: boolean;
}

export function TaskList({
  tasks,
  locale,
  onCompleteTask,
  onDeleteTask,
  onTaskClick,
  loading,
}: TaskListProps) {
  const t = useTranslations();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface border border-surface-light rounded-xl p-6 animate-pulse"
          >
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-surface-light" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-3/4 bg-surface-light rounded" />
                <div className="h-4 w-1/2 bg-surface-light rounded" />
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-surface-light rounded-full" />
                  <div className="h-6 w-16 bg-surface-light rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-surface-light flex items-center justify-center mb-4">
          <ClipboardList className="w-10 h-10 text-text-muted" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          {t('tasks.noTasks')}
        </h3>
        <p className="text-text-secondary max-w-sm">
          {t('tasks.noTasksDesc')}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-4"
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
    >
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            locale={locale}
            onComplete={onCompleteTask}
            onDelete={onDeleteTask}
            onClick={onTaskClick}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
