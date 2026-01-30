'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const hasValue = props.value !== undefined && props.value !== '';
    const isFloating = isFocused || hasValue;
    const isPassword = type === 'password';

    return (
      <div className="relative w-full">
        {/* Icon */}
        {icon && (
          <div className="absolute start-4 top-1/2 -translate-y-1/2 text-text-muted z-10">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          type={isPassword && showPassword ? 'text' : type}
          className={cn(
            'w-full bg-surface border-2 rounded-lg',
            'text-text-primary placeholder-transparent',
            'transition-all duration-200',
            'focus:outline-none focus:border-coral-500',
            'peer',
            icon ? 'ps-12' : 'ps-4',
            isPassword ? 'pe-12' : 'pe-4',
            label ? 'pt-6 pb-2' : 'py-3',
            error ? 'border-red-500' : 'border-surface-light hover:border-surface-light/80',
            className
          )}
          placeholder={label || ' '}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Floating Label */}
        {label && (
          <motion.label
            className={cn(
              'absolute start-4 pointer-events-none',
              'transition-all duration-200',
              icon && 'start-12',
              error ? 'text-red-400' : isFocused ? 'text-coral-500' : 'text-text-muted'
            )}
            initial={false}
            animate={{
              top: isFloating ? '8px' : '50%',
              y: isFloating ? 0 : '-50%',
              fontSize: isFloating ? '12px' : '14px',
            }}
            transition={{ duration: 0.15 }}
          >
            {label}
          </motion.label>
        )}

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            className="absolute end-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}

        {/* Focus glow effect */}
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isFocused ? 1 : 0,
            boxShadow: isFocused ? '0 0 0 3px rgba(255, 107, 107, 0.1)' : '0 0 0 0px rgba(255, 107, 107, 0)',
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-red-400 text-sm mt-1 ms-1"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
