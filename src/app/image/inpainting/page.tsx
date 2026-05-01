'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTaskPolling } from '@/lib/kie/useTaskPolling';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Sparkles,
  Zap,
  Loader2,
  Paintbrush,
  Image as ImageIcon,
  X,
  Eraser,
  Undo2,
} from 'lucide-react';

export default function InpaintingPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [fillPrompt, setFillPrompt] = useState('');
  const [brushSize, setBrushSize] = useState(20);
  const [sensitivity, setSensitivity] = useState(50);
  const [activeTool, setActiveTool] = useState<'brush' | 'eraser'>('brush');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { result, start, reset } = useTaskPolling();
  const isGenerating = result.state === 'generating' || result.state === 'waiting' || result.state === 'queuing';

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!data.url) throw new Error('Upload failed');
    return data.url;
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setUploadedFile(file);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedFile || !fillPrompt.trim()) return;
    const fileUrl = await uploadFile(uploadedFile);
    start({
      endpoint: '/api/generate/image',
      body: { provider: 'gpt', prompt: fillPrompt, filesUrl: [fileUrl], sensitivity },
      taskType: 'gpt-image',
      onSuccess: () => reset(),
      onError: (msg) => console.error('Inpainting failed:', msg),
    });
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Inpainting" />

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Panel */}
          <div className="w-full lg:w-[420px] border-r border-[#2A2A2A] overflow-y-auto p-5 space-y-5">
            {/* Upload Area */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Kaynak G&ouml;rsel
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {uploadedImage ? (
                <div className="relative rounded-xl border border-[#2A2A2A] overflow-hidden group">
                  <img
                    src={uploadedImage}
                    alt="Y&uuml;klenen g&ouml;rsel"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleUpload}
                  className="w-full h-48 rounded-xl border-2 border-dashed border-[#2A2A2A] bg-[#141414] hover:border-purple-500/50 hover:bg-[#1E1E1E] transition-all flex flex-col items-center justify-center gap-3 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">G&ouml;rsel y&uuml;kle</p>
                    <p className="text-xs text-gray-600 mt-1">
                      S&uuml;r&uuml;kle b&#x131;rak veya t&#x131;kla
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* Brush Tools */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Maskeleme Arac&#x131;
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTool('brush')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all',
                    activeTool === 'brush'
                      ? 'border-purple-500 bg-purple-500/10 text-white'
                      : 'border-[#2A2A2A] bg-[#141414] text-gray-400 hover:border-[#3A3A3A]'
                  )}
                >
                  <Paintbrush className="w-4 h-4" />
                  F&#x131;r&ccedil;a
                </button>
                <button
                  onClick={() => setActiveTool('eraser')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all',
                    activeTool === 'eraser'
                      ? 'border-purple-500 bg-purple-500/10 text-white'
                      : 'border-[#2A2A2A] bg-[#141414] text-gray-400 hover:border-[#3A3A3A]'
                  )}
                >
                  <Eraser className="w-4 h-4" />
                  Silgi
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-[#2A2A2A] bg-[#141414] text-gray-400 hover:border-[#3A3A3A] transition-all text-sm">
                  <Undo2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Brush Size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  F&#x131;r&ccedil;a Boyutu
                </label>
                <span className="text-xs text-white font-mono bg-[#1E1E1E] px-2 py-0.5 rounded">
                  {brushSize}px
                </span>
              </div>
              <Slider
                value={[brushSize]}
                onValueChange={(v) => setBrushSize(Array.isArray(v) ? v[0] : v)}
                min={5}
                max={80}
                step={1}
                className="w-full"
              />
            </div>

            {/* Fill Prompt */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Doldurma Talimat&#x131;
              </label>
              <Textarea
                value={fillPrompt}
                onChange={(e) => setFillPrompt(e.target.value)}
                placeholder="Maske alan&#x131;na ne yerle&#x15F;tirilece&#x11F;ini yaz&#x131;n..."
                className="min-h-[100px] bg-[#141414] border-[#2A2A2A] text-white placeholder:text-gray-600 resize-none"
              />
            </div>

            {/* Sensitivity Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Hassasiyet
                </label>
                <span className="text-xs text-white font-mono bg-[#1E1E1E] px-2 py-0.5 rounded">
                  {sensitivity}%
                </span>
              </div>
              <Slider
                value={[sensitivity]}
                onValueChange={(v) => setSensitivity(Array.isArray(v) ? v[0] : v)}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>Yumu&#x15F;ak Ge&ccedil;i&#x15F;</span>
                <span>Keskin Kenar</span>
              </div>
            </div>

            {/* Generate Button */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleGenerate}
                disabled={!uploadedImage || !fillPrompt.trim() || isGenerating}
                className="w-full h-11 bg-[#00FF88] hover:bg-[#00E67A] text-black font-semibold text-sm rounded-lg gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Dolduruluyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Doldur
                  </>
                )}
              </Button>
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <Zap className="w-3 h-3 text-purple-400" />
                <span>
                  Maliyet: <strong className="text-white">5 kredi</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel - Canvas Area */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-white">
                Maskeleme Alan&#x131;
              </h2>
              <Badge
                variant="outline"
                className="text-[10px] border-[#2A2A2A] text-gray-500"
              >
                <Paintbrush className="w-3 h-3 mr-1" />
                Canvas
              </Badge>
            </div>

            {isGenerating ? (
              <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] aspect-video flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  <span className="text-sm text-gray-500">
                    Maske alan&#x131; dolduruluyor...
                  </span>
                </div>
              </div>
            ) : result.state === 'success' && result.resultUrls?.[0] ? (
              <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
                <img src={result.resultUrls[0]} alt="Sonu&ccedil;" className="w-full aspect-video object-contain" />
              </div>
            ) : uploadedImage ? (
              <div className="space-y-4">
                <div className="relative rounded-xl border border-[#2A2A2A] overflow-hidden">
                  <div className="aspect-video relative bg-[#141414]">
                    <img
                      src={uploadedImage}
                      alt="Canvas"
                      className="w-full h-full object-contain"
                    />
                    {/* Mask overlay placeholder */}
                    <div className="absolute inset-0 bg-purple-500/10 pointer-events-none" />
                    {/* Brush cursor indicator */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div
                        className="rounded-full border-2 border-purple-400/60 bg-purple-500/20"
                        style={{
                          width: brushSize * 2,
                          height: brushSize * 2,
                        }}
                      />
                    </div>
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <Badge className="bg-black/60 backdrop-blur-sm text-white text-[10px] border-0">
                        F&#x131;r&ccedil;a: {brushSize}px
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-300 text-[10px] border-0">
                        {activeTool === 'brush' ? 'F&#x131;r&ccedil;a' : 'Silgi'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  G&ouml;rsel &uuml;zerinde s&uuml;r&uuml;kleyerek maske
                  &ccedil;izin. Mor alanlar de&#x11F;i&#x15F;tirilecek
                  b&ouml;lgeleri g&ouml;sterir.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#2A2A2A] bg-[#0A0A0A] aspect-video flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-600">
                  <Paintbrush className="w-10 h-10" />
                  <div className="text-center">
                    <p className="text-sm">
                      Inpainting i&ccedil;in g&ouml;rsel y&uuml;kleyin
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      Maskeleme alan&#x131; burada g&ouml;r&uuml;nt&uuml;lenecek
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
