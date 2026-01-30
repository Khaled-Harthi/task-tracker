'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { pageVariants, staggerContainerVariants, staggerItemVariants } from '@/lib/motion';
import { authApi } from '@/lib/api';
import { Mail, Lock, User, Sparkles, Check, X } from 'lucide-react';

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password strength indicators
  const passwordChecks = [
    { label: '6 أحرف على الأقل', check: password.length >= 6 },
    { label: 'حرف كبير', check: /[A-Z]/.test(password) },
    { label: 'رقم', check: /[0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: apiError } = await authApi.register(email, password, name);

    if (apiError) {
      setError(apiError);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/dashboard`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -start-40 w-96 h-96 bg-coral-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -end-40 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-md relative z-10"
      >
        {/* Logo/Title */}
        <motion.div
          className="text-center mb-8"
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div
            variants={staggerItemVariants}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-coral-500/10 border border-coral-500/20 mb-4"
          >
            <Sparkles className="w-8 h-8 text-coral-500" />
          </motion.div>
          <motion.h1
            variants={staggerItemVariants}
            className="text-3xl font-bold text-text-primary"
          >
            {t('auth.welcome')}
          </motion.h1>
          <motion.p
            variants={staggerItemVariants}
            className="text-text-secondary mt-2"
          >
            {t('auth.register')} {t('app.name')}
          </motion.p>
        </motion.div>

        {/* Register Card */}
        <Card variant="glass" className="border-coral-500/10">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-coral-500/50 to-transparent" />

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit}>
              <motion.div
                className="space-y-5"
                variants={staggerContainerVariants}
                initial="initial"
                animate="animate"
              >
                <motion.div variants={staggerItemVariants}>
                  <Input
                    type="text"
                    label={t('auth.name')}
                    icon={<User className="w-5 h-5" />}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </motion.div>

                <motion.div variants={staggerItemVariants}>
                  <Input
                    type="email"
                    label={t('auth.email')}
                    icon={<Mail className="w-5 h-5" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    dir="ltr"
                  />
                </motion.div>

                <motion.div variants={staggerItemVariants}>
                  <Input
                    type="password"
                    label={t('auth.password')}
                    icon={<Lock className="w-5 h-5" />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    dir="ltr"
                  />

                  {/* Password strength indicators */}
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 space-y-1"
                    >
                      {passwordChecks.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-2 text-sm"
                        >
                          {item.check ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <X className="w-4 h-4 text-text-muted" />
                          )}
                          <span className={item.check ? 'text-emerald-500' : 'text-text-muted'}>
                            {item.label}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.div variants={staggerItemVariants}>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    loading={loading}
                  >
                    {t('auth.register')}
                  </Button>
                </motion.div>
              </motion.div>
            </form>

            {/* Login link */}
            <motion.div
              variants={staggerItemVariants}
              initial="initial"
              animate="animate"
              className="mt-6 text-center text-sm text-text-secondary"
            >
              {t('auth.hasAccount')}{' '}
              <Link
                href={`/${locale}/login`}
                className="text-coral-500 hover:text-coral-400 font-medium transition-colors"
              >
                {t('auth.login')}
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
