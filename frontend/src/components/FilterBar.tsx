'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { accordionVariants } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { Tag, TaskFilters } from '@/lib/api';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  Flag,
  CheckSquare,
  Tag as TagIcon,
} from 'lucide-react';

interface FilterBarProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  tags: Tag[];
}

const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
const STATUSES = ['todo', 'in_progress', 'done'] as const;

export function FilterBar({ filters, onFiltersChange, tags }: FilterBarProps) {
  const t = useTranslations();
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFiltersCount = [
    filters.status?.length || 0,
    filters.priority?.length || 0,
    filters.tags?.length || 0,
    filters.search ? 1 : 0,
    filters.overdue ? 1 : 0,
    filters.dueToday ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const toggleFilter = <K extends keyof TaskFilters>(
    key: K,
    value: string
  ) => {
    const current = (filters[key] as string[] | undefined) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: updated.length ? updated : undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const priorityLabels: Record<string, string> = {
    low: t('tasks.priority.low'),
    medium: t('tasks.priority.medium'),
    high: t('tasks.priority.high'),
    urgent: t('tasks.priority.urgent'),
  };

  const statusLabels: Record<string, string> = {
    todo: t('tasks.status.todo'),
    in_progress: t('tasks.status.in_progress'),
    done: t('tasks.status.done'),
  };

  const priorityColors: Record<string, string> = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#f97316',
    urgent: '#FF6B6B',
  };

  const statusColors: Record<string, string> = {
    todo: '#a3a3a3',
    in_progress: '#3b82f6',
    done: '#10b981',
  };

  return (
    <div className="bg-surface border border-surface-light rounded-xl">
      {/* Search and toggle bar */}
      <div className="p-4 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder={t('filters.search')}
            value={filters.search || ''}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value || undefined })
            }
            className={cn(
              'w-full bg-surface-light border border-surface-light rounded-lg',
              'ps-10 pe-4 py-2.5 text-text-primary placeholder-text-muted',
              'focus:outline-none focus:border-coral-500 transition-colors'
            )}
          />
        </div>

        <Button
          variant={isExpanded ? 'primary' : 'secondary'}
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">{t('filters.title')}</span>
          {activeFiltersCount > 0 && (
            <span className="bg-coral-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" onClick={clearFilters} className="shrink-0">
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">{t('filters.clear')}</span>
          </Button>
        )}
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={accordionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-surface-light pt-4">
              {/* Quick filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() =>
                    onFiltersChange({ ...filters, overdue: !filters.overdue, dueToday: undefined })
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    filters.overdue
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-surface-light text-text-secondary hover:text-text-primary'
                  )}
                >
                  {t('tasks.overdue')}
                </button>
                <button
                  onClick={() =>
                    onFiltersChange({ ...filters, dueToday: !filters.dueToday, overdue: undefined })
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    filters.dueToday
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-surface-light text-text-secondary hover:text-text-primary'
                  )}
                >
                  {t('tasks.dueToday')}
                </button>
              </div>

              {/* Priority filter */}
              <div>
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                  <Flag className="w-4 h-4" />
                  <span>{t('filters.byPriority')}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRIORITIES.map((priority) => (
                    <button
                      key={priority}
                      onClick={() => toggleFilter('priority', priority)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        'border',
                        filters.priority?.includes(priority)
                          ? 'border-current'
                          : 'border-transparent bg-surface-light'
                      )}
                      style={{
                        color: filters.priority?.includes(priority)
                          ? priorityColors[priority]
                          : undefined,
                        backgroundColor: filters.priority?.includes(priority)
                          ? `${priorityColors[priority]}20`
                          : undefined,
                      }}
                    >
                      {priorityLabels[priority]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status filter */}
              <div>
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                  <CheckSquare className="w-4 h-4" />
                  <span>{t('filters.byStatus')}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => toggleFilter('status', status)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        'border',
                        filters.status?.includes(status)
                          ? 'border-current'
                          : 'border-transparent bg-surface-light'
                      )}
                      style={{
                        color: filters.status?.includes(status)
                          ? statusColors[status]
                          : undefined,
                        backgroundColor: filters.status?.includes(status)
                          ? `${statusColors[status]}20`
                          : undefined,
                      }}
                    >
                      {statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags filter */}
              {tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                    <TagIcon className="w-4 h-4" />
                    <span>{t('filters.byTag')}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => toggleFilter('tags', tag.id)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                          'border',
                          filters.tags?.includes(tag.id)
                            ? 'border-current'
                            : 'border-transparent'
                        )}
                        style={{
                          color: filters.tags?.includes(tag.id) ? tag.color : undefined,
                          backgroundColor: filters.tags?.includes(tag.id)
                            ? `${tag.color}20`
                            : 'var(--tw-bg-opacity, 1)',
                        }}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
