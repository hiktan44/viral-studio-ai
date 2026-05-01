import { create } from 'zustand';

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  tag: string; // @Image 1, @Video 1, etc.
}

export interface Clip {
  id: string;
  prompt: string;
  thumbnail: string;
  duration: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  videoUrl?: string;
  assetRefs: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  scenes?: ScenePlan[];
}

export interface ScenePlan {
  id: string;
  title: string;
  description: string;
  duration: number;
  assetRefs: string[];
  timestamp: string; // [0-3s], [3-10s] format
}

export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  thumbnail: string;
  clips: Clip[];
  assets: Asset[];
  messages: ChatMessage[];
}

export interface Board {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  thumbnail: string;
  storyFrames: StoryFrame[];
}

export interface StoryFrame {
  id: string;
  imageUrl: string;
  prompt: string;
  duration: number;
  cameraMotion: 'static' | 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right';
  status: 'pending' | 'generating' | 'completed';
}

interface AppState {
  // Credits
  credits: number;
  plan: 'free' | 'pro' | 'unlimited';

  // Projects
  projects: Project[];
  currentProject: Project | null;

  // Boards
  boards: Board[];
  currentBoard: Board | null;

  // Generation state
  isGenerating: boolean;

  // Sidebar
  sidebarCollapsed: boolean;

  // Actions
  setCredits: (credits: number) => void;
  deductCredits: (amount: number) => void;
  setPlan: (plan: 'free' | 'pro' | 'unlimited') => void;
  addProject: (project: Project) => void;
  setCurrentProject: (project: Project | null) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  addBoard: (board: Board) => void;
  setCurrentBoard: (board: Board | null) => void;
  deleteBoard: (id: string) => void;
  setIsGenerating: (generating: boolean) => void;
  toggleSidebar: () => void;
  addClipToProject: (projectId: string, clip: Clip) => void;
  addMessageToProject: (projectId: string, message: ChatMessage) => void;
  addAssetToProject: (projectId: string, asset: Asset) => void;
  updateClipStatus: (projectId: string, clipId: string, status: Clip['status'], videoUrl?: string) => void;
}

// Mock data
const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Premium Denim Campaign',
    createdAt: new Date('2026-04-16'),
    updatedAt: new Date('2026-04-28'),
    thumbnail: '/api/placeholder/400/225',
    clips: [
      { id: 'clip-1', prompt: 'Wide shot of model walking through urban street at golden hour', thumbnail: '/api/placeholder/160/90', duration: 5, status: 'completed', videoUrl: '', assetRefs: ['@Image 1'] },
      { id: 'clip-2', prompt: 'Close-up of denim texture and stitching details', thumbnail: '/api/placeholder/160/90', duration: 5, status: 'completed', videoUrl: '', assetRefs: [] },
      { id: 'clip-3', prompt: 'Model spinning to show the fit and flow of the jeans', thumbnail: '/api/placeholder/160/90', duration: 5, status: 'generating', assetRefs: ['@Image 2'] },
    ],
    assets: [
      { id: 'asset-1', name: 'model-front.jpg', type: 'image', url: '/api/placeholder/400/600', thumbnail: '/api/placeholder/80/80', tag: '@Image 1' },
      { id: 'asset-2', name: 'denim-detail.jpg', type: 'image', url: '/api/placeholder/400/400', thumbnail: '/api/placeholder/80/80', tag: '@Image 2' },
    ],
    messages: [
      { id: 'msg-1', role: 'user', content: 'Create a premium denim campaign video showcasing the new collection', timestamp: new Date('2026-04-16T10:00:00') },
      { id: 'msg-2', role: 'agent', content: 'I\'ll create a stunning denim campaign! Here\'s my scene plan:', timestamp: new Date('2026-04-16T10:00:05'), scenes: [
        { id: 'sc-1', title: 'Opening Shot', description: 'Wide shot of model walking through urban street at golden hour, warm lighting, cinematic motion', duration: 5, assetRefs: ['@Image 1'], timestamp: '[0-5s]' },
        { id: 'sc-2', title: 'Detail Shot', description: 'Close-up of denim texture, stitching details, premium quality visible', duration: 5, assetRefs: [], timestamp: '[5-10s]' },
        { id: 'sc-3', title: 'Movement Shot', description: 'Model spinning to show the fit and flow, dynamic camera movement', duration: 5, assetRefs: ['@Image 2'], timestamp: '[10-15s]' },
      ]},
    ],
  },
  {
    id: 'proj-2',
    name: 'Summer Collection Launch',
    createdAt: new Date('2026-04-20'),
    updatedAt: new Date('2026-04-25'),
    thumbnail: '/api/placeholder/400/225',
    clips: [],
    assets: [],
    messages: [],
  },
  {
    id: 'proj-3',
    name: 'Brand Story Video',
    createdAt: new Date('2026-04-22'),
    updatedAt: new Date('2026-04-22'),
    thumbnail: '/api/placeholder/400/225',
    clips: [],
    assets: [],
    messages: [],
  },
];

const mockBoards: Board[] = [
  {
    id: 'board-1',
    name: 'My First Board',
    createdAt: new Date('2026-04-28'),
    updatedAt: new Date('2026-04-30'),
    thumbnail: '/api/placeholder/400/225',
    storyFrames: [],
  },
  {
    id: 'board-2',
    name: 'Product Launch Story',
    createdAt: new Date('2026-04-25'),
    updatedAt: new Date('2026-04-29'),
    thumbnail: '/api/placeholder/400/225',
    storyFrames: [],
  },
];

export const useAppStore = create<AppState>((set) => ({
  credits: 60,
  plan: 'pro',
  projects: mockProjects,
  currentProject: null,
  boards: mockBoards,
  currentBoard: null,
  isGenerating: false,
  sidebarCollapsed: false,

  setCredits: (credits) => set({ credits }),
  deductCredits: (amount) => set((state) => ({ credits: Math.max(0, state.credits - amount) })),
  setPlan: (plan) => set({ plan }),
  addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
  setCurrentProject: (project) => set({ currentProject: project }),
  deleteProject: (id) => set((state) => ({ projects: state.projects.filter(p => p.id !== id) })),
  duplicateProject: (id) => set((state) => {
    const original = state.projects.find(p => p.id === id);
    if (!original) return state;
    const dup: Project = {
      ...original,
      id: `proj-${Date.now()}`,
      name: `${original.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return { projects: [dup, ...state.projects] };
  }),
  renameProject: (id, name) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, name } : p),
  })),
  addBoard: (board) => set((state) => ({ boards: [board, ...state.boards] })),
  setCurrentBoard: (board) => set({ currentBoard: board }),
  deleteBoard: (id) => set((state) => ({ boards: state.boards.filter(b => b.id !== id) })),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  addClipToProject: (projectId, clip) => set((state) => ({
    projects: state.projects.map(p =>
      p.id === projectId ? { ...p, clips: [...p.clips, clip] } : p
    ),
  })),
  addMessageToProject: (projectId, message) => set((state) => ({
    projects: state.projects.map(p =>
      p.id === projectId ? { ...p, messages: [...p.messages, message] } : p
    ),
  })),
  addAssetToProject: (projectId, asset) => set((state) => ({
    projects: state.projects.map(p =>
      p.id === projectId ? { ...p, assets: [...p.assets, asset] } : p
    ),
  })),
  updateClipStatus: (projectId, clipId, status, videoUrl) => set((state) => ({
    projects: state.projects.map(p =>
      p.id === projectId ? {
        ...p,
        clips: p.clips.map(c =>
          c.id === clipId ? { ...c, status, ...(videoUrl ? { videoUrl } : {}) } : c
        ),
      } : p
    ),
  })),
}));
