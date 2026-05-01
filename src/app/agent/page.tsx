'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TopBar } from '@/components/layout/TopBar';
import { useAppStore, type Project } from '@/store';
import { useTaskPolling } from '@/lib/kie/useTaskPolling';
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
  MoreHorizontal,
  Plus,
  Upload,
  Sparkles,
  Image as ImageIcon,
  Star,
  Pencil,
  Copy,
  Trash2,
  ChevronDown,
  Zap,
  Video,
  Clock,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const VERSION_OPTIONS = ['V1', 'V2'] as const;
const MODEL_OPTIONS = ['Seedance 2.0'] as const;
const ASPECT_RATIOS = ['16:9', '9:16', '1:1'] as const;
const RESOLUTIONS = ['720p', '1080p'] as const;
const DURATIONS = ['5s', '10s', '15s'] as const;

/* ------------------------------------------------------------------ */
/*  Reusable segmented-control                                         */
/* ------------------------------------------------------------------ */

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] p-0.5', className)}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            'px-2.5 py-1 text-xs font-medium rounded-md transition-all',
            value === opt
              ? 'bg-[#1E1E1E] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-300'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page component                                                */
/* ------------------------------------------------------------------ */

export default function AgentPage() {
  const router = useRouter();
  const {
    credits,
    projects,
    addProject,
    deleteProject,
    duplicateProject,
    renameProject,
    deductCredits,
    isGenerating,
    setIsGenerating,
  } = useAppStore();

  /* ---- agent card state ---- */
  const [version, setVersion] = useState<(typeof VERSION_OPTIONS)[number]>('V2');
  const [model, setModel] = useState<(typeof MODEL_OPTIONS)[number]>('Seedance 2.0');
  const [aspectRatio, setAspectRatio] = useState<(typeof ASPECT_RATIOS)[number]>('16:9');
  const [resolution, setResolution] = useState<(typeof RESOLUTIONS)[number]>('1080p');
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>('5s');
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---- rename state ---- */
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  /* ---- file handling ---- */
  const handleFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const valid = Array.from(incoming).filter((f) =>
        ['image/png', 'image/jpeg', 'image/webp', 'video/mp4'].includes(f.type)
      );
      setFiles((prev) => [...prev, ...valid].slice(0, 5));
    },
    []
  );

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  /* ---- polling hook for video generation ---- */
  const videoPolling = useTaskPolling();

  /* ---- generate ---- */
  const handleGenerate = async () => {
    if (isGenerating || credits < 15 || !prompt.trim()) return;
    setIsGenerating(true);
    deductCredits(15);

    const proj: Project = {
      id: `proj-${Date.now()}`,
      name: prompt.slice(0, 40) || 'Untitled Project',
      createdAt: new Date(),
      updatedAt: new Date(),
      thumbnail: '',
      clips: [],
      assets: [],
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: prompt.trim(),
          timestamp: new Date(),
        },
      ],
    };
    addProject(proj);

    try {
      // 1. Call agent chat to get a scene plan
      const chatRes = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const chatData = await chatRes.json();

      if (!chatData.success) {
        throw new Error(chatData.error || 'Agent yaniti alinamadi');
      }

      // Parse scene plans from the agent response
      let scenes: Array<{ title: string; description: string; duration?: number; timestamp?: string }> = [];
      try {
        scenes = JSON.parse(chatData.response);
      } catch {
        // If response isn't JSON, treat it as a single scene description
        scenes = [{ title: 'Scene 1', description: chatData.response, duration: 5 }];
      }

      // 2. Start video generation for each scene
      for (const scene of scenes) {
        const videoBody: Record<string, unknown> = {
          provider: 'seedance',
          prompt: scene.description || scene.title,
          duration: scene.duration || 5,
          aspectRatio,
          resolution,
        };

        videoPolling.start({
          endpoint: '/api/generate/video',
          body: videoBody,
          taskType: 'video',
          onError: (msg) => console.error('Video generation error:', msg),
        });
      }
    } catch (err) {
      console.error('Generate error:', err);
    } finally {
      setIsGenerating(false);
      router.push(`/agent/${proj.id}`);
    }
  };

  /* ---- start empty ---- */
  const handleStartScratch = () => {
    const proj: Project = {
      id: `proj-${Date.now()}`,
      name: 'Untitled Project',
      createdAt: new Date(),
      updatedAt: new Date(),
      thumbnail: '',
      clips: [],
      assets: [],
      messages: [],
    };
    addProject(proj);
    router.push(`/agent/${proj.id}`);
  };

  /* ---- rename helpers ---- */
  const beginRename = (p: Project) => {
    setRenamingId(p.id);
    setRenameValue(p.name);
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      renameProject(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  /* ---- render ---- */
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <TopBar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* ============================================================ */}
        {/*  HERO                                                        */}
        {/* ============================================================ */}
        <section className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
              Create Any Video
            </span>
            ,{' '}
            <span className="text-white">Just Tell Your Agent</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Describe your vision, upload references, and let AI craft stunning videos in seconds.
          </p>
        </section>

        {/* ============================================================ */}
        {/*  VIDEO AGENT CARD                                            */}
        {/* ============================================================ */}
        <section className="bg-[#141414] border border-[#2A2A2A] rounded-2xl overflow-hidden">
          {/* card header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#2A2A2A]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <Video className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">Video Agent</span>
            </div>
            <SegmentedControl options={VERSION_OPTIONS} value={version} onChange={setVersion} />
          </div>

          {/* reference upload area */}
          <div className="px-5 pt-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
                dragOver
                  ? 'border-purple-500 bg-purple-500/5'
                  : 'border-[#2A2A2A] hover:border-[#3A3A3A] bg-[#0A0A0A]'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept="image/png,image/jpeg,image/webp,video/mp4"
                onChange={(e) => handleFiles(e.target.files)}
              />
              {files.length === 0 ? (
                <div className="space-y-2">
                  <Upload className="w-6 h-6 text-gray-600 mx-auto" />
                  <p className="text-sm text-gray-500">
                    Drop references here or{' '}
                    <span className="text-purple-400">browse</span>
                  </p>
                  <p className="text-xs text-gray-600">1 – 5 files (PNG, JPG, WebP, MP4)</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 justify-center">
                  {files.map((f, i) => (
                    <div
                      key={i}
                      className="relative group bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-xs text-gray-300 flex items-center gap-1.5"
                    >
                      <ImageIcon className="w-3 h-3 text-purple-400" />
                      <span className="max-w-[100px] truncate">{f.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(i);
                        }}
                        className="ml-1 text-gray-600 hover:text-red-400 transition-colors"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  {files.length < 5 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="bg-[#1E1E1E] border border-dashed border-[#3A3A3A] rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:text-purple-400 hover:border-purple-500/40 transition-colors"
                    >
                      + Add
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* prompt area */}
          <div className="px-5 pt-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your video... Use @mention to reference uploaded assets"
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors min-h-[80px]"
            />
          </div>

          {/* bottom toolbar */}
          <div className="px-5 py-3 border-t border-[#2A2A2A] mt-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* model */}
              <div className="flex items-center gap-1.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-2.5 py-1.5">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as (typeof MODEL_OPTIONS)[number])}
                  className="bg-transparent text-xs text-gray-300 outline-none cursor-pointer"
                >
                  {MODEL_OPTIONS.map((m) => (
                    <option key={m} value={m} className="bg-[#141414]">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* aspect ratio */}
              <SegmentedControl
                options={ASPECT_RATIOS}
                value={aspectRatio}
                onChange={setAspectRatio}
              />

              {/* resolution */}
              <SegmentedControl
                options={RESOLUTIONS}
                value={resolution}
                onChange={setResolution}
              />

              {/* duration */}
              <SegmentedControl
                options={DURATIONS}
                value={duration}
                onChange={setDuration}
              />

              <div className="flex-1" />

              {/* credits */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Star className="w-3 h-3 text-purple-400" />
                <span>15</span>
              </div>

              {/* generate */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || credits < 15 || videoPolling.result.state === 'generating'}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium h-8 px-4 rounded-lg transition-colors"
              >
                {isGenerating || videoPolling.result.state === 'waiting' || videoPolling.result.state === 'queuing' || videoPolling.result.state === 'generating' ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {videoPolling.result.state === 'generating' ? 'Uretiliyor...' : 'Baslatiliyor...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Generate
                  </span>
                )}
              </Button>

              {/* CTA */}
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold h-8 px-4 rounded-lg transition-colors">
                <Zap className="w-3 h-3 mr-1" />
                Try Unlimited
              </Button>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  PROJECTS                                                    */}
        {/* ============================================================ */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-white">
            Your Projects{' '}
            <span className="text-gray-500 font-normal">({projects.length})</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* existing projects */}
            {projects.map((project) => (
              <motion.div
                key={project.id}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group bg-[#141414] border border-[#2A2A2A] rounded-xl overflow-hidden cursor-pointer hover:border-[#3A3A3A] transition-colors"
                onClick={() => router.push(`/agent/${project.id}`)}
              >
                {/* thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-purple-900/30 via-[#141414] to-emerald-900/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="w-8 h-8 text-gray-700" />
                  </div>
                  {/* badge */}
                  {project.clips.length > 0 && (
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-md px-2 py-0.5 text-[10px] text-gray-300 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {project.clips.reduce((a, c) => a + c.duration, 0)}s
                    </div>
                  )}
                </div>

                {/* info */}
                <div className="px-3 py-2.5 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    {renamingId === project.id ? (
                      <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitRename();
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-[#0A0A0A] border border-purple-500/50 rounded px-2 py-0.5 text-sm text-white outline-none"
                      />
                    ) : (
                      <>
                        <p className="text-sm font-medium text-white truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(project.updatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </>
                    )}
                  </div>

                  {/* dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-md text-gray-600 hover:text-white hover:bg-[#1E1E1E] transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={4}>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          beginRename(project);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateProject(project.id);
                        }}
                      >
                        <Copy className="w-3.5 h-3.5 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(project.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}

            {/* start from scratch */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={handleStartScratch}
              className="group aspect-video bg-[#141414] border-2 border-dashed border-[#2A2A2A] rounded-xl flex flex-col items-center justify-center gap-2 hover:border-purple-500/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center group-hover:border-purple-500/40 transition-colors">
                <Plus className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
              </div>
              <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">
                Start from Scratch
              </span>
            </motion.button>
          </div>
        </section>
      </div>
    </div>
  );
}
