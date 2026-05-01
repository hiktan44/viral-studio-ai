'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type Project, type ChatMessage, type ScenePlan, type Clip } from '@/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  Send,
  Upload,
  Sparkles,
  Image as ImageIcon,
  Video,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MessageSquare,
  Pencil,
  Check,
  X,
  Clock,
  Layers,
  RefreshCw,
  Scissors,
  GripHorizontal,
  Wand2,
} from 'lucide-react';

/* =================================================================== */
/*  Constants                                                          */
/* =================================================================== */

const MODEL_OPTIONS = ['Seedance 2.0'] as const;
const ASPECT_RATIOS = ['16:9', '9:16', '1:1'] as const;
const DURATIONS = ['5s', '10s', '15s'] as const;
const STYLE_OPTIONS = ['Auto', 'Cinematic', 'Anime', 'Photorealistic', '3D Render'] as const;

/* =================================================================== */
/*  Main page component                                                */
/* =================================================================== */

export default function AgentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const {
    projects,
    currentProject,
    setCurrentProject,
    renameProject,
    addMessageToProject,
    addClipToProject,
    addAssetToProject,
    updateClipStatus,
    isGenerating,
    setIsGenerating,
    deductCredits,
  } = useAppStore();

  /* ---- find project ---- */
  const project = projects.find((p) => p.id === projectId) ?? null;

  useEffect(() => {
    if (project) setCurrentProject(project);
  }, [project, setCurrentProject]);

  /* ---- project name editing ---- */
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  const startEditName = () => {
    if (!project) return;
    setNameValue(project.name);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const commitName = () => {
    if (nameValue.trim() && project) {
      renameProject(project.id, nameValue.trim());
    }
    setEditingName(false);
  };

  /* ---- chat state ---- */
  const [chatInput, setChatInput] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<(typeof STYLE_OPTIONS)[number]>('Auto');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [project?.messages.length]);

  const sendMessage = () => {
    if (!chatInput.trim() || !project) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date(),
    };
    addMessageToProject(project.id, userMsg);
    setChatInput('');

    // simulate agent response
    setTimeout(() => {
      const agentMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'agent',
        content: "Here's the scene plan I've prepared for you:",
        timestamp: new Date(),
        scenes: [
          {
            id: `sc-${Date.now()}`,
            title: 'Opening Shot',
            description: 'Cinematic wide shot establishing the scene with dynamic lighting',
            duration: 5,
            assetRefs: [],
            timestamp: '[0-5s]',
          },
          {
            id: `sc-${Date.now() + 1}`,
            title: 'Detail Shot',
            description: 'Close-up focusing on key details with shallow depth of field',
            duration: 5,
            assetRefs: [],
            timestamp: '[5-10s]',
          },
        ],
      };
      if (project) addMessageToProject(project.id, agentMsg);
    }, 1000);
  };

  /* ---- playback state ---- */
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const totalDuration = project?.clips.reduce((a, c) => a + c.duration, 0) || 30;

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setCurrentTime((t) => {
        if (t >= totalDuration) {
          setPlaying(false);
          return 0;
        }
        return +(t + 0.1).toFixed(1);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [playing, totalDuration]);

  /* ---- zoom ---- */
  const [zoom, setZoom] = useState(100);

  /* ---- clip inspector ---- */
  const [activeClipIdx, setActiveClipIdx] = useState(0);
  const clips = project?.clips ?? [];
  const activeClip = clips[activeClipIdx] ?? null;

  /* ---- bottom bar tabs ---- */
  const [bottomTab, setBottomTab] = useState<'assets' | 'generated'>('assets');

  /* ---- generation params ---- */
  const [model, setModel] = useState<(typeof MODEL_OPTIONS)[number]>('Seedance 2.0');
  const [aspectRatio, setAspectRatio] = useState<(typeof ASPECT_RATIOS)[number]>('16:9');
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>('5s');

  /* ---- file upload for assets ---- */
  const assetInputRef = useRef<HTMLInputElement>(null);

  const handleAssetUpload = (files: FileList | null) => {
    if (!files || !project) return;
    Array.from(files).forEach((f, i) => {
      addAssetToProject(project.id, {
        id: `asset-${Date.now()}-${i}`,
        name: f.name,
        type: f.type.startsWith('video') ? 'video' : 'image',
        url: URL.createObjectURL(f),
        thumbnail: URL.createObjectURL(f),
        tag: `@Image ${project.assets.length + i + 1}`,
      });
    });
  };

  /* ---- generate clip ---- */
  const handleGenerateClip = () => {
    if (!project || isGenerating) return;
    setIsGenerating(true);
    deductCredits(15);
    const clip: Clip = {
      id: `clip-${Date.now()}`,
      prompt: activeClip?.prompt || 'New generated clip',
      thumbnail: '',
      duration: parseInt(duration),
      status: 'generating',
      assetRefs: [],
    };
    addClipToProject(project.id, clip);
    setTimeout(() => {
      updateClipStatus(project.id, clip.id, 'completed', '');
      setIsGenerating(false);
    }, 2000);
  };

  /* ---- handle no project ---- */
  if (!project) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-500">Project not found</p>
          <Button
            variant="outline"
            onClick={() => router.push('/agent')}
            className="border-[#2A2A2A] text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Agent
          </Button>
        </div>
      </div>
    );
  }

  /* =================================================================== */
  /*  RENDER                                                             */
  /* =================================================================== */

  return (
    <div className="h-screen bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* ============================================================== */}
      {/*  TOP BAR                                                        */}
      {/* ============================================================== */}
      <header className="h-12 border-b border-[#2A2A2A] bg-[#0A0A0A]/90 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/agent')}
            className="p-1.5 rounded-lg hover:bg-[#1E1E1E] text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {editingName ? (
            <div className="flex items-center gap-1.5">
              <input
                ref={nameInputRef}
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitName();
                  if (e.key === 'Escape') setEditingName(false);
                }}
                className="bg-[#0A0A0A] border border-purple-500/50 rounded-md px-2 py-0.5 text-sm text-white outline-none min-w-[200px]"
              />
              <button onClick={commitName} className="text-green-400 hover:text-green-300">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setEditingName(false)} className="text-gray-500 hover:text-gray-300">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={startEditName}
              className="flex items-center gap-2 group"
            >
              <h1 className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">
                {project.name}
              </h1>
              <Pencil className="w-3 h-3 text-gray-600 group-hover:text-purple-400 transition-colors" />
            </button>
          )}

          <span className="text-xs text-gray-600">
            {new Date(project.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white text-xs h-7"
          >
            <MessageSquare className="w-3 h-3 mr-1.5" />
            Feedback
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-7 px-3 rounded-lg transition-colors">
            Disa Aktar
          </Button>
        </div>
      </header>

      {/* ============================================================== */}
      {/*  MAIN 3-PANEL LAYOUT                                            */}
      {/* ============================================================== */}
      <div className="flex flex-1 overflow-hidden">
        {/* =========================================================== */}
        {/*  LEFT PANEL – Chat                                           */}
        {/* =========================================================== */}
        <aside className="w-[340px] shrink-0 border-r border-[#2A2A2A] flex flex-col bg-[#0D0D0D]">
          {/* messages */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-thin scrollbar-thumb-[#2A2A2A]">
            {project.messages.length === 0 && (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-700/20 border border-purple-500/20 flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-sm text-gray-500">
                  Describe your video and the AI agent will create a scene plan for you.
                </p>
              </div>
            )}

            {project.messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {msg.role === 'agent' ? (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-gray-300">{msg.content}</p>

                      {/* scene plan cards */}
                      {msg.scenes && msg.scenes.length > 0 && (
                        <div className="space-y-2">
                          {msg.scenes.map((scene) => (
                            <motion.div
                              key={scene.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-3 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-white">
                                  {scene.title}
                                </span>
                                <span className="text-[10px] text-purple-400 bg-purple-500/10 rounded px-1.5 py-0.5 font-mono">
                                  {scene.timestamp}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 leading-relaxed">
                                {scene.description}
                              </p>
                              {scene.assetRefs.length > 0 && (
                                <div className="flex gap-1">
                                  {scene.assetRefs.map((ref) => (
                                    <span
                                      key={ref}
                                      className="text-[10px] bg-purple-500/10 text-purple-400 rounded px-1.5 py-0.5 flex items-center gap-1"
                                    >
                                      <ImageIcon className="w-2.5 h-2.5" />
                                      {ref}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="flex gap-1.5 pt-1">
                                <button className="text-[10px] bg-[#1E1E1E] border border-[#2A2A2A] rounded-md px-2 py-1 text-gray-400 hover:text-white hover:border-[#3A3A3A] transition-colors">
                                  Yalnzca Ekle
                                </button>
                                <button className="text-[10px] bg-purple-600/20 border border-purple-500/30 rounded-md px-2 py-1 text-purple-400 hover:bg-purple-600/30 transition-colors">
                                  Ekle ve Uret
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl rounded-tr-sm px-3 py-2 max-w-[85%]">
                      <p className="text-sm text-gray-200">{msg.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* chat input */}
          <div className="border-t border-[#2A2A2A] p-3 space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => assetInputRef.current?.click()}
                className="p-1.5 rounded-lg hover:bg-[#1E1E1E] text-gray-500 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <input
                ref={assetInputRef}
                type="file"
                multiple
                className="hidden"
                accept="image/*,video/*"
                onChange={(e) => handleAssetUpload(e.target.files)}
              />

              <div className="flex-1 relative">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Describe your video..."
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>

              <button
                onClick={sendMessage}
                disabled={!chatInput.trim()}
                className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* style selector */}
            <div className="flex items-center gap-2 px-1">
              <span className="text-[10px] text-gray-600">Stil:</span>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value as (typeof STYLE_OPTIONS)[number])}
                className="bg-transparent text-[10px] text-gray-500 outline-none cursor-pointer"
              >
                {STYLE_OPTIONS.map((s) => (
                  <option key={s} value={s} className="bg-[#141414]">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* =========================================================== */}
        {/*  CENTER PANEL – Video Player + Timeline                     */}
        {/* =========================================================== */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* video player */}
          <div className="flex-1 flex items-center justify-center p-6 bg-[#080808]">
            <div
              className="relative w-full max-w-3xl bg-black rounded-xl overflow-hidden shadow-2xl shadow-black/50"
              style={{ aspectRatio: '16/9' }}
            >
              {/* placeholder gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-black to-emerald-900/10 flex items-center justify-center">
                {activeClip ? (
                  <div className="text-center space-y-2">
                    <Video className="w-10 h-10 text-gray-800 mx-auto" />
                    <p className="text-xs text-gray-700 max-w-xs">{activeClip.prompt}</p>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <Play className="w-10 h-10 text-gray-800 mx-auto" />
                    <p className="text-xs text-gray-700">Generate clips to preview</p>
                  </div>
                )}
              </div>

              {/* play overlay */}
              <button
                onClick={() => setPlaying(!playing)}
                className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  {playing ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-0.5" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* playback controls */}
          <div className="h-10 border-t border-[#2A2A2A] bg-[#0A0A0A] flex items-center px-4 gap-3 shrink-0">
            <button
              onClick={() => setPlaying(!playing)}
              className="p-1 rounded hover:bg-[#1E1E1E] text-gray-400 hover:text-white transition-colors"
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setCurrentTime(0)}
              className="p-1 rounded hover:bg-[#1E1E1E] text-gray-500 hover:text-white transition-colors"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs text-gray-500 font-mono tabular-nums min-w-[100px]">
              {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
            </span>

            {/* progress bar */}
            <div className="flex-1 h-1 bg-[#1E1E1E] rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-100"
                style={{ width: `${(currentTime / totalDuration) * 100}%` }}
              />
            </div>

            {/* zoom */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom((z) => Math.max(50, z - 10))}
                className="p-1 rounded hover:bg-[#1E1E1E] text-gray-500 hover:text-white transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-gray-600 w-8 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(200, z + 10))}
                className="p-1 rounded hover:bg-[#1E1E1E] text-gray-500 hover:text-white transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* timeline */}
          <div className="h-24 border-t border-[#2A2A2A] bg-[#0D0D0D] flex items-center px-4 gap-2 overflow-x-auto shrink-0 scrollbar-thin scrollbar-thumb-[#2A2A2A]">
            {clips.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-gray-600">
                  No clips yet. Generate your first clip from the chat.
                </p>
              </div>
            ) : (
              <>
                {clips.map((clip, i) => (
                  <button
                    key={clip.id}
                    onClick={() => setActiveClipIdx(i)}
                    className={cn(
                      'shrink-0 w-28 h-16 rounded-lg border-2 overflow-hidden relative group transition-colors',
                      i === activeClipIdx
                        ? 'border-purple-500'
                        : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-[#141414] flex items-center justify-center">
                      <Video className="w-4 h-4 text-gray-700" />
                    </div>
                    {/* clip number */}
                    <div className="absolute top-1 left-1 bg-black/70 rounded px-1 text-[9px] text-gray-400">
                      {i + 1}
                    </div>
                    {/* status indicator */}
                    <div
                      className={cn(
                        'absolute top-1 right-1 w-1.5 h-1.5 rounded-full',
                        clip.status === 'completed'
                          ? 'bg-green-400'
                          : clip.status === 'generating'
                          ? 'bg-yellow-400 animate-pulse'
                          : clip.status === 'failed'
                          ? 'bg-red-400'
                          : 'bg-gray-600'
                      )}
                    />
                    {/* duration */}
                    <div className="absolute bottom-1 right-1 bg-black/70 rounded px-1 text-[8px] text-gray-500">
                      {clip.duration}s
                    </div>
                  </button>
                ))}

                {/* add clip button */}
                <button className="shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-[#2A2A2A] flex items-center justify-center hover:border-purple-500/40 transition-colors">
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>
              </>
            )}

            {/* playhead */}
            {clips.length > 0 && (
              <div
                className="absolute bottom-0 w-0.5 h-6 bg-purple-500 pointer-events-none transition-all duration-100 z-10"
                style={{
                  left: `calc(340px + 24px + ${(currentTime / totalDuration) * (clips.length * 120)}px)`,
                }}
              />
            )}
          </div>
        </main>

        {/* =========================================================== */}
        {/*  RIGHT PANEL – Clip Inspector                                */}
        {/* =========================================================== */}
        <aside className="w-[280px] shrink-0 border-l border-[#2A2A2A] flex flex-col bg-[#0D0D0D]">
          {/* clip header */}
          <div className="h-10 border-b border-[#2A2A2A] flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
              <Scissors className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-medium text-white">
                Clip {activeClipIdx + 1}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveClipIdx((i) => Math.max(0, i - 1))}
                disabled={activeClipIdx === 0}
                className="p-1 rounded hover:bg-[#1E1E1E] text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() =>
                  setActiveClipIdx((i) => Math.min(clips.length - 1, i + 1))
                }
                disabled={activeClipIdx >= clips.length - 1}
                className="p-1 rounded hover:bg-[#1E1E1E] text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* clip details */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeClip ? (
              <>
                {/* preview */}
                <div
                  className="relative rounded-lg overflow-hidden bg-[#141414]"
                  style={{ aspectRatio: '16/9' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-[#141414] flex items-center justify-center">
                    <Video className="w-6 h-6 text-gray-700" />
                  </div>
                  {activeClip.status === 'generating' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* prompt */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-gray-600">
                    Prompt
                  </label>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {activeClip.prompt}
                  </p>
                </div>

                {/* metadata */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Duration</span>
                    <span className="text-gray-400">{activeClip.duration}s</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={cn(
                        activeClip.status === 'completed'
                          ? 'text-green-400'
                          : activeClip.status === 'generating'
                          ? 'text-yellow-400'
                          : activeClip.status === 'failed'
                          ? 'text-red-400'
                          : 'text-gray-500'
                      )}
                    >
                      {activeClip.status}
                    </span>
                  </div>
                </div>

                {/* asset refs */}
                {activeClip.assetRefs.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-gray-600">
                      References
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {activeClip.assetRefs.map((ref) => (
                        <span
                          key={ref}
                          className="text-[10px] bg-purple-500/10 text-purple-400 rounded px-1.5 py-0.5 flex items-center gap-1"
                        >
                          <ImageIcon className="w-2.5 h-2.5" />
                          {ref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* regenerate */}
                <Button
                  onClick={handleGenerateClip}
                  disabled={isGenerating}
                  variant="outline"
                  className="w-full border-[#2A2A2A] text-gray-400 hover:text-white hover:border-purple-500/40 text-xs h-8"
                >
                  <RefreshCw className="w-3 h-3 mr-1.5" />
                  Regenerate Clip
                </Button>
              </>
            ) : (
              <div className="text-center py-12 space-y-3">
                <Scissors className="w-8 h-8 text-gray-800 mx-auto" />
                <p className="text-xs text-gray-600">
                  Select a clip from the timeline to inspect
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ============================================================== */}
      {/*  BOTTOM BAR                                                     */}
      {/* ============================================================== */}
      <div className="h-20 border-t border-[#2A2A2A] bg-[#0A0A0A] flex items-stretch shrink-0">
        {/* tabs + assets */}
        <div className="flex-1 flex flex-col">
          {/* tab header */}
          <div className="h-9 flex items-center gap-4 px-4 border-b border-[#1A1A1A]">
            <button
              onClick={() => setBottomTab('assets')}
              className={cn(
                'text-[10px] uppercase tracking-wider font-medium transition-colors',
                bottomTab === 'assets'
                  ? 'text-purple-400'
                  : 'text-gray-600 hover:text-gray-400'
              )}
            >
              VARLIKLAR ({project.assets.length})
            </button>
            <button
              onClick={() => setBottomTab('generated')}
              className={cn(
                'text-[10px] uppercase tracking-wider font-medium transition-colors',
                bottomTab === 'generated'
                  ? 'text-purple-400'
                  : 'text-gray-600 hover:text-gray-400'
              )}
            >
              OLUSTURULANLAR ({clips.length})
            </button>
          </div>

          {/* asset thumbnails */}
          <div className="flex-1 flex items-center gap-2 px-4 overflow-x-auto scrollbar-thin scrollbar-thumb-[#2A2A2A]">
            {bottomTab === 'assets' ? (
              project.assets.length === 0 ? (
                <p className="text-[10px] text-gray-700">
                  No assets yet. Upload from the chat panel.
                </p>
              ) : (
                project.assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="shrink-0 w-12 h-12 rounded-lg border border-[#2A2A2A] bg-[#141414] overflow-hidden relative group cursor-pointer hover:border-purple-500/40 transition-colors"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-[#141414] flex items-center justify-center">
                      {asset.type === 'image' ? (
                        <ImageIcon className="w-3.5 h-3.5 text-gray-600" />
                      ) : (
                        <Video className="w-3.5 h-3.5 text-gray-600" />
                      )}
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-black/80 px-1 py-0.5">
                      <p className="text-[7px] text-gray-400 truncate">{asset.tag}</p>
                    </div>
                  </div>
                ))
              )
            ) : clips.length === 0 ? (
              <p className="text-[10px] text-gray-700">
                No generated clips yet.
              </p>
            ) : (
              clips.map((clip, i) => (
                <div
                  key={clip.id}
                  onClick={() => setActiveClipIdx(i)}
                  className={cn(
                    'shrink-0 w-16 h-10 rounded-lg border overflow-hidden cursor-pointer transition-colors',
                    i === activeClipIdx
                      ? 'border-purple-500'
                      : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                  )}
                >
                  <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-[#141414] flex items-center justify-center">
                    <span className="text-[8px] text-gray-600">{clip.duration}s</span>
                  </div>
                </div>
              ))
            )}

            {/* upload button */}
            {bottomTab === 'assets' && (
              <button
                onClick={() => assetInputRef.current?.click()}
                className="shrink-0 w-12 h-12 rounded-lg border-2 border-dashed border-[#2A2A2A] flex items-center justify-center hover:border-purple-500/40 transition-colors"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* generation controls */}
        <div className="w-[420px] border-l border-[#2A2A2A] flex items-center gap-2 px-4">
          {/* video/image toggle */}
          <div className="flex rounded-lg bg-[#141414] border border-[#2A2A2A] p-0.5">
            <button className="px-2 py-1 text-[10px] font-medium rounded-md bg-[#1E1E1E] text-white">
              <Video className="w-3 h-3 inline mr-1" />
              Video
            </button>
            <button className="px-2 py-1 text-[10px] font-medium rounded-md text-gray-600 hover:text-gray-400 transition-colors">
              <ImageIcon className="w-3 h-3 inline mr-1" />
              Image
            </button>
          </div>

          {/* model */}
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as (typeof MODEL_OPTIONS)[number])}
            className="bg-[#141414] border border-[#2A2A2A] rounded-lg px-2 py-1 text-[10px] text-gray-400 outline-none cursor-pointer"
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m} value={m} className="bg-[#141414]">
                {m}
              </option>
            ))}
          </select>

          {/* aspect */}
          <div className="flex rounded-lg bg-[#141414] border border-[#2A2A2A] p-0.5">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar}
                onClick={() => setAspectRatio(ar)}
                className={cn(
                  'px-1.5 py-0.5 text-[9px] font-medium rounded-md transition-all',
                  aspectRatio === ar
                    ? 'bg-[#1E1E1E] text-white'
                    : 'text-gray-600 hover:text-gray-400'
                )}
              >
                {ar}
              </button>
            ))}
          </div>

          {/* duration */}
          <div className="flex rounded-lg bg-[#141414] border border-[#2A2A2A] p-0.5">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={cn(
                  'px-1.5 py-0.5 text-[9px] font-medium rounded-md transition-all',
                  duration === d
                    ? 'bg-[#1E1E1E] text-white'
                    : 'text-gray-600 hover:text-gray-400'
                )}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* generate */}
          <Button
            onClick={handleGenerateClip}
            disabled={isGenerating}
            className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-medium h-7 px-3 rounded-lg transition-colors"
          >
            {isGenerating ? (
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Generate
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
