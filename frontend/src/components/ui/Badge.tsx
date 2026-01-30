'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { pulseVariants } from '@/lib/motion';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'priority' | 'status' | 'tag';
  color?: string;
  pulse?: boolean;
  size?: 'sm' | 'md';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', color, pulse = false, size = 'md', children, style, ...props }, ref) => {
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
    };

    const variants = {
      default: 'bg-surface-light text-text-secondary',
      priority: '',
      status: '',
      tag: 'bg-opacity-20',
    };

    const getPriorityStyles = () => {
      if (variant !== 'priority' || !color) return {};
      return {
        backgroundColor: `${color}20`,
        color: color,
        borderColor: `${color}40`,
      };
    };

    const getStatusStyles = () => {
      if (variant !== 'status' || !color) return {};
      return {
        backgroundColor: `${color}20`,
        color: color,
      };
    };

    const getTagStyles = () => {
      if (variant !== 'tag' || !color) return {};
      return {
        backgroundColor: `${color}20`,
        color: color,
        borderColor: `${color}30`,
      };
    };

    const customStyles = {
      ...getPriorityStyles(),
      ...getStatusStyles(),
      ...getTagStyles(),
      ...style,
    };

    return (
      <motion.span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-medium',
          'border border-transparent',
          sizes[size],
          variants[variant],
          className
        )}
        style={customStyles}
        variants={pulse ? pulseVariants : undefined}
        initial={pulse ? 'initial' : undefined}
        animate={pulse ? 'animate' : undefined}
        {...props}
      >
        {children}
      </motion.span>
    );
  }
);

Badge.displayName = 'Badge';

// Predefined badge variants for priorities
const PriorityBadge = ({ priority, ...props }: { priority: string } & Omit<BadgeProps, 'variant' | 'color'>) => {
  const colors: Record<string, string> = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#f97316',
    urgent: '#FF6B6B',
  };

  const labels: Record<string, string> = {
    low: 'منخفض',
    medium: 'متوسط',
    high: 'عالي',
    urgent: 'عاجل',
  };

  return (
    <Badge variant="priority" color={colors[priority]} pulse={priority === 'urgent'} {...props}>
      {labels[priority] || priority}
    </Badge>
  );
};

// Predefined badge variants for status
const StatusBadge = ({ status, ...props }: { status: string } & Omit<BadgeProps, 'variant' | 'color'>) => {
  const colors: Record<string, string> = {
    todo: '#a3a3a3',
    in_progress: '#3b82f6',
    done: '#10b981',
  };

  const labels: Record<string, string> = {
    todo: 'قيد الانتظار',
    in_progress: 'قيد التنفيذ',
    done: 'مكتمل',
  };

  return (
    <Badge variant="status" color={colors[status]} {...props}>
      {labels[status] || status}
    </Badge>
  );
};

export { Badge, PriorityBadge, StatusBadge };
