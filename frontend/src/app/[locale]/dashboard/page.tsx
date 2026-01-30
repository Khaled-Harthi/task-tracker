'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { TaskList } from '@/components/TaskList';
import { FilterBar } from '@/components/FilterBar';
import { TagPicker } from '@/components/TagPicker';
import { Button } from '@/components/ui/Button';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { pageVariants } from '@/lib/motion';
import { cn } from '@/lib/utils';
import {
  authApi,
  projectsApi,
  tasksApi,
  tagsApi,
  type Project,
  type Task,
  type Tag,
  type TaskFilters,
  type CreateTaskData,
} from '@/lib/api';
import {
  Plus,
  FileText,
  Calendar,
  Flag,
  LayoutDashboard,
} from 'lucide-react';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

export default function DashboardPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [filters, setFilters] = useState<TaskFilters>({});
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Task modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState<CreateTaskData>({
    title: '',
    description: '',
    projectId: '',
    priority: 'medium',
    dueDate: null,
  });
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);

    const [projectsRes, tagsRes, userRes] = await Promise.all([
      projectsApi.list(),
      tagsApi.list(),
      authApi.me(),
    ]);

    if (userRes.error) {
      router.push(`/${locale}/login`);
      return;
    }

    if (projectsRes.data) setProjects(projectsRes.data.projects);
    if (tagsRes.data) setTags(tagsRes.data.tags);

    setLoading(false);
  }, [router, locale]);

  const fetchTasks = useCallback(async () => {
    const tasksRes = await tasksApi.list({
      ...filters,
      projectId: selectedProjectId,
    });
    if (tasksRes.data) setTasks(tasksRes.data.tasks);
  }, [filters, selectedProjectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!loading) {
      fetchTasks();
    }
  }, [fetchTasks, loading]);

  // Handlers
  const handleCreateProject = async (data: { name: string; color: string }) => {
    const res = await projectsApi.create(data);
    if (res.data) {
      setProjects((prev) => [res.data!.project, ...prev]);
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    router.push(`/${locale}/login`);
  };

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'done' ? 'todo' : 'done';
    const res = await tasksApi.update(taskId, { status: newStatus });

    if (res.data) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? res.data!.task : t))
      );
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await tasksApi.delete(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      projectId: task.projectId,
      priority: task.priority,
      dueDate: task.dueDate || null,
    });
    setSelectedTagIds(task.tags.map((t) => t.id));
    setShowTaskModal(true);
  };

  const handleOpenNewTaskModal = () => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      projectId: selectedProjectId || projects[0]?.id || '',
      priority: 'medium',
      dueDate: null,
    });
    setSelectedTagIds([]);
    setShowTaskModal(true);
  };

  const handleSaveTask = async () => {
    if (!taskForm.title.trim() || !taskForm.projectId) return;

    setSaving(true);

    if (editingTask) {
      // Update existing task
      const res = await tasksApi.update(editingTask.id, taskForm);
      if (res.data) {
        // Update tags
        const currentTagIds = editingTask.tags.map((t) => t.id);
        const toAdd = selectedTagIds.filter((id) => !currentTagIds.includes(id));
        const toRemove = currentTagIds.filter((id) => !selectedTagIds.includes(id));

        if (toAdd.length > 0) {
          await tasksApi.addTags(editingTask.id, toAdd);
        }
        for (const tagId of toRemove) {
          await tasksApi.removeTag(editingTask.id, tagId);
        }

        fetchTasks();
      }
    } else {
      // Create new task
      const res = await tasksApi.create(taskForm);
      if (res.data && selectedTagIds.length > 0) {
        await tasksApi.addTags(res.data.task.id, selectedTagIds);
        fetchTasks();
      } else if (res.data) {
        setTasks((prev) => [res.data!.task, ...prev]);
      }
    }

    setSaving(false);
    setShowTaskModal(false);
  };

  const handleCreateTag = async (data: { name: string; color: string }) => {
    const res = await tagsApi.create(data);
    if (res.data) {
      setTags((prev) => [...prev, res.data!.tag]);
      return res.data.tag;
    }
    return undefined;
  };

  const priorityLabels: Record<string, string> = {
    low: t('tasks.priority.low'),
    medium: t('tasks.priority.medium'),
    high: t('tasks.priority.high'),
    urgent: t('tasks.priority.urgent'),
  };

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <ProjectSidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        onCreateProject={handleCreateProject}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <motion.main
        className={cn(
          'transition-all duration-200 p-6',
          sidebarCollapsed ? 'me-16' : 'me-72'
        )}
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                <LayoutDashboard className="w-7 h-7 text-coral-500" />
                {selectedProjectId
                  ? projects.find((p) => p.id === selectedProjectId)?.name
                  : t('app.dashboard')}
              </h1>
              <p className="text-text-secondary mt-1">
                {tasks.length} {t('tasks.title')}
              </p>
            </div>
            <Button onClick={handleOpenNewTaskModal}>
              <Plus className="w-5 h-5" />
              {t('tasks.addNew')}
            </Button>
          </div>

          {/* Filter bar */}
          <div className="mb-6">
            <FilterBar
              filters={filters}
              onFiltersChange={setFilters}
              tags={tags}
            />
          </div>

          {/* Task list */}
          <TaskList
            tasks={tasks}
            locale={locale}
            onCompleteTask={handleCompleteTask}
            onDeleteTask={handleDeleteTask}
            onTaskClick={handleTaskClick}
            loading={loading}
          />
        </div>
      </motion.main>

      {/* Task Modal */}
      <Modal
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title={editingTask ? t('tasks.edit') : t('tasks.addNew')}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label={t('tasks.title')}
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            icon={<FileText className="w-5 h-5" />}
          />

          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              {t('tasks.description')} ({t('common.optional')})
            </label>
            <textarea
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
              className={cn(
                'w-full bg-surface border-2 border-surface-light rounded-lg',
                'p-3 text-text-primary placeholder-text-muted',
                'focus:outline-none focus:border-coral-500 transition-colors',
                'min-h-[100px] resize-none'
              )}
              placeholder={t('tasks.description')}
            />
          </div>

          {/* Project selector */}
          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              {t('projects.title')}
            </label>
            <div className="flex gap-2 flex-wrap">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setTaskForm({ ...taskForm, projectId: project.id })}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
                    taskForm.projectId === project.id
                      ? 'bg-surface-light text-text-primary border border-coral-500/30'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-light/50'
                  )}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  {project.name}
                </button>
              ))}
            </div>
          </div>

          {/* Priority selector */}
          <div>
            <label className="text-sm text-text-secondary mb-2 flex items-center gap-2">
              <Flag className="w-4 h-4" />
              {t('tasks.priority.label')}
            </label>
            <div className="flex gap-2">
              {PRIORITIES.map((priority) => (
                <button
                  key={priority}
                  onClick={() => setTaskForm({ ...taskForm, priority })}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                    taskForm.priority === priority
                      ? 'border-current'
                      : 'border-transparent bg-surface-light'
                  )}
                  style={{
                    color: taskForm.priority === priority
                      ? priority === 'urgent' ? '#FF6B6B'
                        : priority === 'high' ? '#f97316'
                        : priority === 'medium' ? '#f59e0b'
                        : '#10b981'
                      : undefined,
                    backgroundColor: taskForm.priority === priority
                      ? priority === 'urgent' ? '#FF6B6B20'
                        : priority === 'high' ? '#f9731620'
                        : priority === 'medium' ? '#f59e0b20'
                        : '#10b98120'
                      : undefined,
                  }}
                >
                  {priorityLabels[priority]}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="text-sm text-text-secondary mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t('tasks.dueDate')} ({t('common.optional')})
            </label>
            <input
              type="date"
              value={taskForm.dueDate?.split('T')[0] || ''}
              onChange={(e) =>
                setTaskForm({
                  ...taskForm,
                  dueDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
              className={cn(
                'w-full bg-surface border-2 border-surface-light rounded-lg',
                'px-4 py-2.5 text-text-primary',
                'focus:outline-none focus:border-coral-500 transition-colors'
              )}
            />
          </div>

          {/* Tags */}
          <TagPicker
            tags={tags}
            selectedTagIds={selectedTagIds}
            onTagsChange={setSelectedTagIds}
            onCreateTag={handleCreateTag}
          />
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowTaskModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSaveTask} loading={saving}>
            {t('common.save')}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
