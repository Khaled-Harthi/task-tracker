'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { glowVariants } from '@/lib/motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered';
  hover?: boolean;
  glow?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps & MotionProps>(
  ({ className, variant = 'default', hover = false, glow = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-surface border border-surface-light',
      glass: 'bg-surface/80 backdrop-blur-xl border border-white/5',
      bordered: 'bg-transparent border-2 border-coral-500/30',
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-xl p-6',
          'transition-all duration-200',
          variants[variant],
          hover && 'hover:border-coral-500/30 cursor-pointer',
          glow && 'hover:shadow-glow',
          className
        )}
        variants={glow ? glowVariants : undefined}
        initial={glow ? 'initial' : undefined}
        whileHover={hover || glow ? 'hover' : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1.5 pb-4', className)}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-semibold text-text-primary', className)}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-text-secondary', className)}
      {...props}
    />
  )
);

CardDescription.displayName = 'CardDescription';

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);

CardContent.displayName = 'CardContent';

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-4 border-t border-surface-light', className)}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
