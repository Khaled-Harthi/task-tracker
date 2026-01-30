'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  currentLocale: string;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-text-muted" />
      <div className="flex rounded-lg bg-surface-light p-1">
        <button
          onClick={() => switchLocale('ar')}
          className={cn(
            'px-3 py-1 rounded text-sm font-medium transition-all',
            currentLocale === 'ar'
              ? 'bg-coral-500 text-white'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          العربية
        </button>
        <button
          onClick={() => switchLocale('en')}
          className={cn(
            'px-3 py-1 rounded text-sm font-medium transition-all',
            currentLocale === 'en'
              ? 'bg-coral-500 text-white'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          English
        </button>
      </div>
    </div>
  );
}
