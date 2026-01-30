'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { slideInRightVariants, staggerContainerVariants, staggerItemVariants } from '@/lib/motion';
import { Button } from '@/components/ui/Button';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { Project } from '@/lib/api';
import {
  FolderKanban,
  Plus,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Settings,
  LogOut,
  Palette,
} from 'lucide-react';

interface ProjectSidebarProps {
  projects: Project[];
  selectedProjectId?: string;
  onSelectProject: (projectId?: string) => void;
  onCreateProject: (data: { name: string; color: string }) => Promise<void>;
  onLogout: () => void;
  collapsed?: boolean;
  onToggleCollapse: () => void;
}

const COLORS = [
  '#FF6B6B', // Coral
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
];

export function ProjectSidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  onLogout,
  collapsed = false,
  onToggleCollapse,
}: ProjectSidebarProps) {
  const t = useTranslations();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(COLORS[0]);
  const [creating, setCreating] = useState(false);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setCreating(true);
    await onCreateProject({ name: newProjectName, color: newProjectColor });
    setCreating(false);
    setShowCreateModal(false);
    setNewProjectName('');
    setNewProjectColor(COLORS[0]);
  };

  return (
    <>
      <motion.aside
        className={cn(
          'fixed top-0 end-0 h-full bg-surface border-s border-surface-light z-40',
          'flex flex-col',
          collapsed ? 'w-16' : 'w-72'
        )}
        initial={false}
        animate={{ width: collapsed ? 64 : 288 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Header */}
        <div className="p-4 border-b border-surface-light">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xl font-bold text-text-primary"
              >
                {t('app.name')}
              </motion.h1>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-light transition-colors"
            >
              {collapsed ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* All Tasks Button */}
        <div className="p-3">
          <button
            onClick={() => onSelectProject(undefined)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
              !selectedProjectId
                ? 'bg-coral-500/10 text-coral-500 border border-coral-500/20'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
            )}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{t('projects.all')}</span>}
          </button>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-3 pt-0">
          <div className="flex items-center justify-between mb-2">
            {!collapsed && (
              <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                {t('projects.title')}
              </span>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-1.5 rounded-lg text-text-muted hover:text-coral-500 hover:bg-coral-500/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <motion.div
            className="space-y-1"
            variants={staggerContainerVariants}
            initial="initial"
            animate="animate"
          >
            {projects.map((project) => (
              <motion.button
                key={project.id}
                variants={staggerItemVariants}
                onClick={() => onSelectProject(project.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                  'group',
                  selectedProjectId === project.id
                    ? 'bg-surface-light text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-light/50'
                )}
                whileHover={{ x: collapsed ? 0 : -4 }}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-start truncate">{project.name}</span>
                    <span className="text-xs text-text-muted">
                      {project._count?.tasks || 0}
                    </span>
                  </>
                )}
              </motion.button>
            ))}
          </motion.div>

          {projects.length === 0 && !collapsed && (
            <div className="text-center py-8 text-text-muted text-sm">
              {t('projects.noProjects')}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-surface-light space-y-1">
          <button
            onClick={onLogout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
              'text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors'
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{t('auth.logout')}</span>}
          </button>
        </div>
      </motion.aside>

      {/* Create Project Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('projects.addNew')}
      >
        <div className="space-y-4">
          <Input
            label={t('projects.name')}
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            icon={<FolderKanban className="w-5 h-5" />}
          />

          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              {t('projects.color')}
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewProjectColor(color)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    newProjectColor === color
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-110'
                      : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCreateProject} loading={creating}>
            {t('common.save')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
