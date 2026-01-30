const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'حدث خطأ غير متوقع' };
    }

    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'فشل الاتصال بالخادم' };
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi<{ user: User; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name: string) =>
    fetchApi<{ user: User; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  logout: () =>
    fetchApi<{ message: string }>('/auth/logout', { method: 'POST' }),

  me: () => fetchApi<{ user: User }>('/auth/me'),
};

// Projects API
export const projectsApi = {
  list: () => fetchApi<{ projects: Project[] }>('/projects'),

  get: (id: string) => fetchApi<{ project: Project }>(`/projects/${id}`),

  create: (data: CreateProjectData) =>
    fetchApi<{ project: Project; message: string }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateProjectData>) =>
    fetchApi<{ project: Project; message: string }>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ message: string }>(`/projects/${id}`, { method: 'DELETE' }),
};

// Tasks API
export const tasksApi = {
  list: (filters?: TaskFilters) => {
    const params = new URLSearchParams();
    if (filters?.projectId) params.set('projectId', filters.projectId);
    if (filters?.status?.length) params.set('status', filters.status.join(','));
    if (filters?.priority?.length) params.set('priority', filters.priority.join(','));
    if (filters?.tags?.length) params.set('tags', filters.tags.join(','));
    if (filters?.search) params.set('search', filters.search);
    if (filters?.dueBefore) params.set('dueBefore', filters.dueBefore);
    if (filters?.dueAfter) params.set('dueAfter', filters.dueAfter);
    if (filters?.overdue) params.set('overdue', 'true');
    if (filters?.dueToday) params.set('dueToday', 'true');

    const query = params.toString();
    return fetchApi<{ tasks: Task[] }>(`/tasks${query ? `?${query}` : ''}`);
  },

  get: (id: string) => fetchApi<{ task: Task }>(`/tasks/${id}`),

  create: (data: CreateTaskData) =>
    fetchApi<{ task: Task; message: string }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateTaskData>) =>
    fetchApi<{ task: Task; message: string }>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ message: string }>(`/tasks/${id}`, { method: 'DELETE' }),

  addTags: (id: string, tagIds: string[]) =>
    fetchApi<{ task: Task; message: string }>(`/tasks/${id}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tagIds }),
    }),

  removeTag: (taskId: string, tagId: string) =>
    fetchApi<{ message: string }>(`/tasks/${taskId}/tags/${tagId}`, {
      method: 'DELETE',
    }),

  bulkUpdate: (taskIds: string[], data: { status?: string; projectId?: string }) =>
    fetchApi<{ message: string; count: number }>('/tasks/bulk', {
      method: 'POST',
      body: JSON.stringify({ taskIds, ...data }),
    }),
};

// Tags API
export const tagsApi = {
  list: () => fetchApi<{ tags: Tag[] }>('/tags'),

  create: (data: CreateTagData) =>
    fetchApi<{ tag: Tag; message: string }>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateTagData>) =>
    fetchApi<{ tag: Tag; message: string }>(`/tags/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ message: string }>(`/tags/${id}`, { method: 'DELETE' }),
};

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string; color: string };
  tags: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
}

export interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  projectId: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'todo' | 'in_progress' | 'done';
  dueDate?: string | null;
}

export interface CreateTagData {
  name: string;
  color?: string;
}

export interface TaskFilters {
  projectId?: string;
  status?: string[];
  priority?: string[];
  tags?: string[];
  search?: string;
  dueBefore?: string;
  dueAfter?: string;
  overdue?: boolean;
  dueToday?: boolean;
}
