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
import { Mail, Lock, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: apiError } = await authApi.login(email, password);

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
        {/* Coral gradient orb */}
        <motion.div
          className="absolute -top-40 -end-40 w-96 h-96 bg-coral-500/20 rounded-full blur-3xl"
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
          className="absolute -bottom-40 -start-40 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl"
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
            {t('auth.welcomeBack')}
          </motion.h1>
          <motion.p
            variants={staggerItemVariants}
            className="text-text-secondary mt-2"
          >
            {t('auth.login')} {t('app.name')}
          </motion.p>
        </motion.div>

        {/* Login Card */}
        <Card variant="glass" className="border-coral-500/10">
          {/* Top glow line */}
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
                    {t('auth.login')}
                  </Button>
                </motion.div>
              </motion.div>
            </form>

            {/* Register link */}
            <motion.div
              variants={staggerItemVariants}
              initial="initial"
              animate="animate"
              className="mt-6 text-center text-sm text-text-secondary"
            >
              {t('auth.noAccount')}{' '}
              <Link
                href={`/${locale}/register`}
                className="text-coral-500 hover:text-coral-400 font-medium transition-colors"
              >
                {t('auth.register')}
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
