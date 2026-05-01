'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type StoryFrame, type Board } from '@/store';
import { useTaskPolling, type TaskState } from '@/lib/kie/useTaskPolling';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Share2,
  Download,
  Upload,
  Plus,
  Trash2,
  RefreshCw,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Zap,
  Image as ImageIcon,
  Play,
  Eye,
  MousePointerClick,
  MoveHorizontal,
  ZoomIn,
  ZoomOut,
  Circle,
  BookOpen,
  LayoutGrid,
  Clapperboard,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CAMERA_MOTIONS = [
  { value: 'static', label: 'Statik', icon: Circle },
  { value: 'zoom-in', label: 'Zoom In', icon: ZoomIn },
  { value: 'zoom-out', label: 'Zoom Out', icon: ZoomOut },
  { value: 'pan-left', label: 'Pan Sol', icon: MoveHorizontal },
  { value: 'pan-right', label: 'Pan Sag', icon: MoveHorizontal },
] as const;

const IMAGE_MODELS = [
  { value: 'gpt-image-2', label: 'GPT Image 2' },
  { value: 'nano-banana-2', label: 'Nano Banana 2' },
];

const RESOLUTIONS = [
  { value: '1k', label: '1K' },
  { value: '2k', label: '2K' },
  { value: '4k', label: '4K' },
];

const KEY_MOMENT_OPTIONS = [4, 9, 25];

const FRAME_GRADIENTS = [
  'from-violet-600/40 to-indigo-700/40',
  'from-blue-600/40 to-cyan-700/40',
  'from-emerald-600/40 to-teal-700/40',
  'from-amber-600/40 to-orange-700/40',
  'from-rose-600/40 to-pink-700/40',
  'from-fuchsia-600/40 to-purple-700/40',
  'from-sky-600/40 to-blue-700/40',
  'from-lime-600/40 to-green-700/40',
  'from-red-600/40 to-rose-700/40',
];

/* ------------------------------------------------------------------ */
/*  Tutorial data                                                      */
/* ------------------------------------------------------------------ */

const TUTORIAL_STEPS = [
  {
    number: 1,
    title: 'Hikayenizi Anlatin',
    desc: 'Referans gorsellerinizi yukleyin ve hikayenizi yazin. Ne kadar detayli olursa sonuclar o kadar iyi.',
  },
  {
    number: 2,
    title: 'Storyboard Uretin',
    desc: 'AI hikayenizi analiz eder ve onemli anlari otomatik olarak boler. Her kare icin aciklama ve kamera hareketi belirler.',
  },
  {
    number: 3,
    title: 'Video Uretin',
    desc: 'Storyboard\'inizi onaylayin ve tek tusla profesyonel video olusturun. Her kare AI tarafindan canlandirilir.',
  },
];

const EXAMPLE_SCENARIOS = [
  {
    title: 'Futuristik Surucu',
    story: 'Futuristik bir surucu tunellerden ve firtinalardan hizla geciyor...',
    frameCount: 9,
    gradient: 'from-violet-600/20 to-indigo-800/20',
  },
  {
    title: 'Moda Cekimi',
    story: 'Bir model sehri gezerken farkli mekanlarda poz veriyor...',
    frameCount: 9,
    gradient: 'from-rose-600/20 to-pink-800/20',
  },
  {
    title: 'Urun Lansmani',
    story: 'Yeni bir akilli telefon cesitli ortamlarda kullanilirken gosteriliyor...',
    frameCount: 9,
    gradient: 'from-emerald-600/20 to-teal-800/20',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BoardEditorPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    boards,
    currentBoard,
    credits,
    addBoard,
    setCurrentBoard,
    deductCredits,
  } = useAppStore();

  /* ---- local state ---- */
  const [boardName, setBoardName] = useState('');
  const [story, setStory] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [imageModel, setImageModel] = useState('gpt-image-2');
  const [resolution, setResolution] = useState('2k');
  const [keyMoments, setKeyMoments] = useState(9);
  const [customMoments, setCustomMoments] = useState('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [rightTab, setRightTab] = useState<'tutorial' | 'board'>('tutorial');
  const [frames, setFrames] = useState<StoryFrame[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  /* ---- video generation polling ---- */
  const videoPolling = useTaskPolling();

  const handleGenerateVideo = () => {
    if (frames.length === 0) return;
    deductCredits(frames.length * 0.8);

    // Build a combined storyboard prompt from all frames
    const storyboardPrompt = frames
      .map((f, i) => `Frame ${i + 1} (${f.cameraMotion}, ${f.duration}s): ${f.prompt}`)
      .join('\n');

    videoPolling.start({
      endpoint: '/api/generate/video',
      body: {
        provider: 'seedance',
        prompt: storyboardPrompt,
        duration: frames.reduce((a, f) => a + f.duration, 0),
        aspectRatio,
        frames: frames.map((f) => ({
          prompt: f.prompt,
          duration: f.duration,
          cameraMotion: f.cameraMotion,
        })),
      },
      taskType: 'video',
      onSuccess: (urls) => {
        console.log('Video generated:', urls);
      },
      onError: (msg) => {
        console.error('Video generation failed:', msg);
      },
    });
  };

  /* ---- load board ---- */
  useEffect(() => {
    const existing = boards.find((b) => b.id === boardId);
    if (existing) {
      setCurrentBoard(existing);
      setBoardName(existing.name);
      setFrames(existing.storyFrames);
    } else {
      // Create board on the fly if it doesn't exist (e.g. direct nav)
      const newBoard: Board = {
        id: boardId,
        name: 'Yeni Pano',
        createdAt: new Date(),
        updatedAt: new Date(),
        thumbnail: '',
        storyFrames: [],
      };
      addBoard(newBoard);
      setCurrentBoard(newBoard);
      setBoardName(newBoard.name);
    }
    return () => setCurrentBoard(null);
  }, [boardId, boards, addBoard, setCurrentBoard]);

  /* ---- handlers ---- */
  const handleReferenceUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 16 - referenceImages.length;
    const toAdd = Array.from(files).slice(0, remaining);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setReferenceImages((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeReferenceImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!story.trim()) return;
    setIsGenerating(true);
    setRightTab('board');

    const count =
      keyMoments === -1
        ? parseInt(customMoments) || 9
        : keyMoments;

    // Simulate frame generation
    const newFrames: StoryFrame[] = Array.from({ length: count }, (_, i) => ({
      id: `frame-${Date.now()}-${i}`,
      imageUrl: '',
      prompt: `Kare ${i + 1}: ${story.slice(0, 60)}...`,
      duration: 4,
      cameraMotion: (['static', 'zoom-in', 'zoom-out', 'pan-left', 'pan-right'] as const)[
        i % 5
      ],
      status: 'pending' as const,
    }));

    // Stagger frame appearance
    for (let i = 0; i < newFrames.length; i++) {
      await new Promise((r) => setTimeout(r, 200));
      setFrames((prev) => [...prev, newFrames[i]]);
    }

    // Simulate generation progress
    for (let i = 0; i < newFrames.length; i++) {
      await new Promise((r) => setTimeout(r, 600));
      setFrames((prev) =>
        prev.map((f) =>
          f.id === newFrames[i].id ? { ...f, status: 'generating' as const } : f
        )
      );
      await new Promise((r) => setTimeout(r, 800));
      setFrames((prev) =>
        prev.map((f) =>
          f.id === newFrames[i].id
            ? { ...f, status: 'completed' as const, imageUrl: `gen-${f.id}` }
            : f
        )
      );
    }

    deductCredits(count * 0.8);
    setIsGenerating(false);
  };

  const updateFrame = (id: string, updates: Partial<StoryFrame>) => {
    setFrames((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const deleteFrame = (id: string) => {
    setFrames((prev) => prev.filter((f) => f.id !== id));
  };

  const regenerateFrame = (id: string) => {
    updateFrame(id, { status: 'generating' });
    setTimeout(() => {
      updateFrame(id, { status: 'completed' });
    }, 1500);
  };

  /* ---- drag & drop ---- */
  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    setFrames((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(draggedIndex, 1);
      updated.splice(dropIndex, 0, moved);
      return updated;
    });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const allFramesCompleted =
    frames.length > 0 && frames.every((f) => f.status === 'completed');
  const effectiveKeyMoments =
    keyMoments === -1 ? parseInt(customMoments) || 9 : keyMoments;

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A]">
      {/* ---- Top bar ---- */}
      <header className="h-14 border-b border-[#2A2A2A] bg-[#0A0A0A]/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/board')}
            className="p-1.5 rounded-lg hover:bg-[#1E1E1E] text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <input
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            className="bg-transparent text-sm font-semibold text-white outline-none border-none placeholder:text-gray-500 max-w-[240px]"
            placeholder="Pano adi..."
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-[#1E1E1E] border border-[#2A2A2A] transition-colors">
            <Share2 className="w-3.5 h-3.5" />
            Panoyu Paylas
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-purple-600 hover:bg-purple-500 text-white transition-colors">
            <Download className="w-3.5 h-3.5" />
            Disa Aktar
          </button>
        </div>
      </header>

      {/* ---- Main content ---- */}
      <div className="flex flex-1 overflow-hidden">
        {/* ---- Left panel ---- */}
        <aside className="w-[360px] border-r border-[#2A2A2A] bg-[#0A0A0A] overflow-y-auto shrink-0">
          <div className="p-4 space-y-5">
            {/* Reference images */}
            <section>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">
                Referans Gorseller
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <div
                onClick={handleReferenceUpload}
                className="relative border-2 border-dashed border-[#2A2A2A] hover:border-purple-500/40 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-[#141414]/50 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center group-hover:border-purple-500/30 transition-colors">
                  <Upload className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                </div>
                <p className="text-xs text-gray-400">
                  Gorsel yukle (en fazla {16 - referenceImages.length} adet)
                </p>
                <p className="text-[10px] text-gray-600">Surukle birak veya tikla</p>
              </div>

              {referenceImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {referenceImages.map((img, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-[#2A2A2A]">
                      <img
                        src={img}
                        alt={`Reference ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeReferenceImage(i)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Story textarea */}
            <section>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">
                Hikayeniz
              </label>
              <Textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Futuristik bir surucu tunellerden ve firtinalardan hizla geciyor..."
                className="min-h-[120px] bg-[#141414] border-[#2A2A2A] text-sm text-white placeholder:text-gray-600 resize-none focus-visible:ring-purple-500/40"
              />
            </section>

            {/* Aspect ratio */}
            <section>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block">
                Goruntu Orani
              </label>
              <div className="flex gap-2">
                {(['16:9', '9:16'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-sm font-medium border transition-all',
                      aspectRatio === ratio
                        ? 'bg-purple-500/15 border-purple-500/50 text-purple-300'
                        : 'bg-[#141414] border-[#2A2A2A] text-gray-400 hover:text-white hover:border-[#3A3A3A]'
                    )}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </section>

            {/* Advanced settings */}
            <section>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors w-full"
              >
                {showAdvanced ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                Gelismis Ayarlar
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 mt-4 pt-4 border-t border-[#2A2A2A]">
                      {/* Image model */}
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">
                          Gorsel Modeli
                        </label>
                        <div className="flex gap-2">
                          {IMAGE_MODELS.map((m) => (
                            <button
                              key={m.value}
                              onClick={() => setImageModel(m.value)}
                              className={cn(
                                'flex-1 py-1.5 rounded-lg text-xs border transition-all',
                                imageModel === m.value
                                  ? 'bg-purple-500/15 border-purple-500/50 text-purple-300'
                                  : 'bg-[#141414] border-[#2A2A2A] text-gray-400 hover:text-white'
                              )}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Resolution */}
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">
                          Cozunurluk
                        </label>
                        <div className="flex gap-2">
                          {RESOLUTIONS.map((r) => (
                            <button
                              key={r.value}
                              onClick={() => setResolution(r.value)}
                              className={cn(
                                'flex-1 py-1.5 rounded-lg text-xs border transition-all',
                                resolution === r.value
                                  ? 'bg-purple-500/15 border-purple-500/50 text-purple-300'
                                  : 'bg-[#141414] border-[#2A2A2A] text-gray-400 hover:text-white'
                              )}
                            >
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Key moments */}
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">
                          Onemli An Sayisi
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {[...KEY_MOMENT_OPTIONS, -1].map((n) => (
                            <button
                              key={n}
                              onClick={() => setKeyMoments(n)}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-xs border transition-all',
                                keyMoments === n
                                  ? 'bg-purple-500/15 border-purple-500/50 text-purple-300'
                                  : 'bg-[#141414] border-[#2A2A2A] text-gray-400 hover:text-white'
                              )}
                            >
                              {n === -1 ? 'Ozel' : n}
                            </button>
                          ))}
                          {keyMoments === -1 && (
                            <input
                              type="number"
                              min={1}
                              max={50}
                              value={customMoments}
                              onChange={(e) => setCustomMoments(e.target.value)}
                              placeholder="Sayi"
                              className="w-16 px-2 py-1.5 rounded-lg text-xs bg-[#141414] border border-[#2A2A2A] text-white outline-none focus:border-purple-500/50"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Generate CTA */}
            <Button
              onClick={handleGenerate}
              disabled={!story.trim() || isGenerating}
              className={cn(
                'w-full h-12 text-sm font-semibold rounded-xl transition-all',
                isGenerating
                  ? 'bg-[#1E1E1E] text-gray-400 cursor-wait'
                  : 'bg-[#00FF88] hover:bg-[#00E67A] text-black shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:shadow-[0_0_30px_rgba(0,255,136,0.25)]'
              )}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.span>
                  Uretiliyor...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Storyboard Olustur
                  <span className="ml-1 text-[11px] opacity-70">
                    ✦ {effectiveKeyMoments * 0.8}
                  </span>
                </span>
              )}
            </Button>
          </div>
        </aside>

        {/* ---- Right panel ---- */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Right tabs */}
          <div className="flex items-center gap-1 px-4 pt-3 border-b border-[#2A2A2A] pb-0">
            <button
              onClick={() => setRightTab('tutorial')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2',
                rightTab === 'tutorial'
                  ? 'text-white border-purple-500 bg-[#141414]'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              )}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Tutorial
            </button>
            <button
              onClick={() => setRightTab('board')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2',
                rightTab === 'board'
                  ? 'text-white border-purple-500 bg-[#141414]'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Board
              {frames.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px]">
                  {frames.length}
                </span>
              )}
            </button>
          </div>

          {/* Right content */}
          <div className="flex-1 overflow-y-auto bg-[#0A0A0A]">
            {rightTab === 'tutorial' ? (
              <TutorialPanel />
            ) : (
              <BoardPanel
                frames={frames}
                draggedIndex={draggedIndex}
                dragOverIndex={dragOverIndex}
                isGenerating={isGenerating}
                allFramesCompleted={allFramesCompleted}
                videoPollingState={videoPolling.result.state}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                onUpdateFrame={updateFrame}
                onDeleteFrame={deleteFrame}
                onRegenerateFrame={regenerateFrame}
                onGenerateVideo={handleGenerateVideo}
                onAddFrame={() => {
                  const f: StoryFrame = {
                    id: `frame-${Date.now()}`,
                    imageUrl: '',
                    prompt: '',
                    duration: 4,
                    cameraMotion: 'static',
                    status: 'pending',
                  };
                  setFrames((prev) => [...prev, f]);
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tutorial Panel                                                      */
/* ------------------------------------------------------------------ */

function TutorialPanel() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Steps */}
      <div className="grid grid-cols-3 gap-4">
        {TUTORIAL_STEPS.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-5 text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-400 font-bold text-sm">{step.number}</span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5">{step.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Arrow flow */}
      <div className="flex items-center justify-center gap-3 text-gray-600">
        <span className="text-xs">Hikayenizi Anlatin</span>
        <span className="text-purple-500">→</span>
        <span className="text-xs">Storyboard Uretin</span>
        <span className="text-purple-500">→</span>
        <span className="text-xs">Video Uretin</span>
      </div>

      {/* Example scenarios */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4">Ornek Senaryolar</h3>
        <div className="space-y-4">
          {EXAMPLE_SCENARIOS.map((scenario, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={cn(
                'rounded-xl border border-[#2A2A2A] bg-[#141414] overflow-hidden'
              )}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Reference images preview */}
                  <div className="shrink-0 flex gap-1.5">
                    {[0, 1].map((j) => (
                      <div
                        key={j}
                        className={cn(
                          'w-12 h-12 rounded-lg bg-gradient-to-br border border-[#2A2A2A]',
                          scenario.gradient
                        )}
                      />
                    ))}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white mb-1">
                      {scenario.title}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                      {scenario.story}
                    </p>

                    {/* 9-frame storyboard preview */}
                    <div className="grid grid-cols-9 gap-1">
                      {Array.from({ length: scenario.frameCount }).map((_, j) => (
                        <div
                          key={j}
                          className={cn(
                            'aspect-square rounded bg-gradient-to-br border border-[#2A2A2A]',
                            scenario.gradient
                          )}
                        />
                      ))}
                    </div>

                    {/* Result video placeholder */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1E1E1E] border border-[#2A2A2A]">
                        <Play className="w-3 h-3 text-purple-400" />
                        <span className="text-[10px] text-gray-400">Video Sonucu</span>
                      </div>
                      <div className="flex-1 h-1.5 rounded-full bg-[#1E1E1E] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-emerald-500"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-600">15s</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Board Panel                                                         */
/* ------------------------------------------------------------------ */

function BoardPanel({
  frames,
  draggedIndex,
  dragOverIndex,
  isGenerating,
  allFramesCompleted,
  videoPollingState,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onUpdateFrame,
  onDeleteFrame,
  onRegenerateFrame,
  onGenerateVideo,
  onAddFrame,
}: {
  frames: StoryFrame[];
  draggedIndex: number | null;
  dragOverIndex: number | null;
  isGenerating: boolean;
  allFramesCompleted: boolean;
  videoPollingState: TaskState;
  onDragStart: (i: number) => void;
  onDragOver: (e: React.DragEvent, i: number) => void;
  onDrop: (i: number) => void;
  onDragEnd: () => void;
  onUpdateFrame: (id: string, updates: Partial<StoryFrame>) => void;
  onDeleteFrame: (id: string) => void;
  onRegenerateFrame: (id: string) => void;
  onGenerateVideo: () => void;
  onAddFrame: () => void;
}) {
  if (frames.length === 0 && !isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center mb-4">
          <LayoutGrid className="w-7 h-7 text-gray-500" />
        </div>
        <h3 className="text-white font-medium mb-1">Storyboard bos</h3>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          Hikayenizi yazin ve &quot;Storyboard Olustur&quot; butonuna tiklayin.
          AI hikayenizi karelere bolecek.
        </p>
        <button
          onClick={onAddFrame}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E1E1E] border border-[#2A2A2A] text-sm text-gray-400 hover:text-white hover:border-purple-500/40 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Elle kare ekle
        </button>
      </div>
    );
  }

  const gridSize =
    frames.length <= 4
      ? 'grid-cols-2'
      : frames.length <= 9
        ? 'grid-cols-3'
        : frames.length <= 16
          ? 'grid-cols-4'
          : 'grid-cols-5';

  return (
    <div className="p-6">
      {/* Frame grid */}
      <div className={cn('grid gap-3', gridSize)}>
        <AnimatePresence mode="popLayout">
          {frames.map((frame, index) => (
            <motion.div
              key={frame.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDrop={() => onDrop(index)}
              onDragEnd={onDragEnd}
              className={cn(
                'group relative rounded-xl border bg-[#141414] overflow-hidden transition-all cursor-grab active:cursor-grabbing',
                draggedIndex === index && 'opacity-40 scale-95',
                dragOverIndex === index && 'border-purple-500/60 shadow-[0_0_15px_rgba(139,92,246,0.15)]',
                frame.status === 'generating' && 'pulse-glow',
                frame.status === 'completed'
                  ? 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                  : 'border-[#2A2A2A]'
              )}
            >
              {/* Thumbnail area */}
              <div
                className={cn(
                  'aspect-video relative flex items-center justify-center',
                  frame.status === 'completed'
                    ? 'bg-gradient-to-br from-purple-600/30 to-indigo-700/30'
                    : frame.status === 'generating'
                      ? 'bg-gradient-to-br from-purple-600/20 to-indigo-700/20'
                      : 'bg-[#1E1E1E]'
                )}
              >
                {frame.status === 'generating' && (
                  <div className="flex flex-col items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    >
                      <RefreshCw className="w-5 h-5 text-purple-400" />
                    </motion.div>
                    <span className="text-[10px] text-purple-400/70">Uretiliyor...</span>
                  </div>
                )}
                {frame.status === 'completed' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                )}
                {frame.status === 'pending' && (
                  <ImageIcon className="w-6 h-6 text-gray-600" />
                )}

                {/* Drag handle */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-black/50 backdrop-blur-sm">
                  <GripVertical className="w-3.5 h-3.5 text-gray-300" />
                </div>

                {/* Frame number */}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[10px] text-gray-300 font-mono">
                  {index + 1}
                </div>
              </div>

              {/* Frame controls */}
              <div className="p-3 space-y-2.5">
                {/* Prompt */}
                <textarea
                  value={frame.prompt}
                  onChange={(e) => onUpdateFrame(frame.id, { prompt: e.target.value })}
                  placeholder="Kare aciklamasi..."
                  rows={2}
                  className="w-full bg-transparent text-xs text-gray-300 placeholder:text-gray-600 outline-none resize-none leading-relaxed"
                />

                {/* Duration + Camera motion row */}
                <div className="flex items-center gap-2">
                  {/* Duration */}
                  <div className="flex items-center gap-1 shrink-0">
                    {[3, 4, 5].map((d) => (
                      <button
                        key={d}
                        onClick={() => onUpdateFrame(frame.id, { duration: d })}
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-medium border transition-all',
                          frame.duration === d
                            ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                            : 'bg-transparent border-[#2A2A2A] text-gray-500 hover:text-gray-300'
                        )}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>

                  {/* Camera motion */}
                  <select
                    value={frame.cameraMotion}
                    onChange={(e) =>
                      onUpdateFrame(frame.id, {
                        cameraMotion: e.target.value as StoryFrame['cameraMotion'],
                      })
                    }
                    className="flex-1 bg-[#1E1E1E] border border-[#2A2A2A] rounded px-2 py-1 text-[10px] text-gray-400 outline-none focus:border-purple-500/40 cursor-pointer"
                  >
                    {CAMERA_MOTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onRegenerateFrame(frame.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Yeniden Uret
                  </button>
                  <button
                    onClick={() => onDeleteFrame(frame.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add frame card */}
        <motion.button
          onClick={onAddFrame}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-xl border-2 border-dashed border-[#2A2A2A] hover:border-purple-500/40 bg-[#141414]/30 hover:bg-[#141414] flex flex-col items-center justify-center gap-2 aspect-video transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center group-hover:border-purple-500/30 transition-colors">
            <Plus className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
          </div>
          <span className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">
            Kare Ekle
          </span>
        </motion.button>
      </div>

      {/* Generate video button */}
      {allFramesCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-col items-center gap-3"
        >
          {videoPollingState === 'waiting' || videoPollingState === 'queuing' || videoPollingState === 'generating' ? (
            <div className="flex flex-col items-center gap-2">
              <Button
                disabled
                className="h-12 px-8 text-sm font-semibold rounded-xl bg-[#1E1E1E] text-gray-400 cursor-wait"
              >
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {videoPollingState === 'generating' ? 'Video Uretiliyor...' : 'Kuyruktan alindi...'}
                </span>
              </Button>
              <p className="text-xs text-gray-500">
                Bu islem bir kac dakika surebilir
              </p>
            </div>
          ) : videoPollingState === 'success' ? (
            <div className="flex flex-col items-center gap-2">
              <Button className="h-12 px-8 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black">
                <Play className="w-4 h-4 mr-2" />
                Videoyu Goruntule
              </Button>
              <p className="text-xs text-emerald-400">
                Video basariyla olusturuldu!
              </p>
            </div>
          ) : videoPollingState === 'fail' ? (
            <div className="flex flex-col items-center gap-2">
              <Button
                onClick={onGenerateVideo}
                className="h-12 px-8 text-sm font-semibold rounded-xl bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-400"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tekrar Dene
              </Button>
              <p className="text-xs text-red-400">
                Video olusturulamadi. Tekrar deneyin.
              </p>
            </div>
          ) : (
            <Button
              onClick={onGenerateVideo}
              className="h-12 px-8 text-sm font-semibold rounded-xl bg-[#00FF88] hover:bg-[#00E67A] text-black shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:shadow-[0_0_30px_rgba(0,255,136,0.25)] transition-all"
            >
              <Clapperboard className="w-4 h-4 mr-2" />
              Video Uret
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}
