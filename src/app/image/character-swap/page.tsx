'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
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
  Users,
  Image as ImageIcon,
  X,
  Shuffle,
} from 'lucide-react';

const STYLE_PRESETS = [
  { id: 'realistic', label: 'Ger&ccedil;ek&ccedil;i', gradient: 'from-amber-600/40 to-orange-600/40' },
  { id: 'anime', label: 'Anime', gradient: 'from-pink-600/40 to-rose-600/40' },
  { id: 'cartoon', label: 'Karikat&uuml;r', gradient: 'from-blue-600/40 to-cyan-600/40' },
  { id: '3d', label: '3D Render', gradient: 'from-purple-600/40 to-indigo-600/40' },
  { id: 'pixel', label: 'Pixel Art', gradient: 'from-green-600/40 to-emerald-600/40' },
  { id: 'watercolor', label: 'Suluboya', gradient: 'from-teal-600/40 to-sky-600/40' },
];

export default function CharacterSwapPage() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('realistic');
  const [blendStrength, setBlendStrength] = useState(75);
  const [preservePose, setPreservePose] = useState(true);
  const [swapPrompt, setSwapPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const sourceInputRef = useRef<HTMLInputElement>(null);

  const handleSourceUpload = () => sourceInputRef.current?.click();

  const handleSourceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSourceImage(URL.createObjectURL(file));
    }
  };

  const handleGenerate = () => {
    if (!sourceImage) return;
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Karakter De&#x11F;i&#x15F;imi" />

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Panel */}
          <div className="w-full lg:w-[420px] border-r border-[#2A2A2A] overflow-y-auto p-5 space-y-5">
            {/* Source Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Kaynak G&ouml;rsel
              </label>
              <input
                ref={sourceInputRef}
                type="file"
                accept="image/*"
                onChange={handleSourceFile}
                className="hidden"
              />
              {sourceImage ? (
                <div className="relative rounded-xl border border-[#2A2A2A] overflow-hidden group">
                  <img
                    src={sourceImage}
                    alt="Kaynak"
                    className="w-full h-40 object-cover"
                  />
                  <button
                    onClick={() => setSourceImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSourceUpload}
                  className="w-full h-40 rounded-xl border-2 border-dashed border-[#2A2A2A] bg-[#141414] hover:border-purple-500/50 hover:bg-[#1E1E1E] transition-all flex flex-col items-center justify-center gap-3 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Karakter g&ouml;rseli y&uuml;kle</p>
                    <p className="text-xs text-gray-600 mt-1">
                      S&uuml;r&uuml;kle b&#x131;rak veya t&#x131;kla
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* Style Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Hedef Stil
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STYLE_PRESETS.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all',
                      selectedStyle === style.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-[#2A2A2A] bg-[#141414] hover:border-[#3A3A3A]'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg bg-gradient-to-br',
                        style.gradient
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs',
                        selectedStyle === style.id
                          ? 'text-white'
                          : 'text-gray-400'
                      )}
                    >
                      {style.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Ek Talimat (Opsiyonel)
              </label>
              <Textarea
                value={swapPrompt}
                onChange={(e) => setSwapPrompt(e.target.value)}
                placeholder="Karakter de&#x11F;i&#x15F;imi i&ccedil;in ek a&ccedil;&#x131;klama..."
                className="min-h-[70px] bg-[#141414] border-[#2A2A2A] text-white placeholder:text-gray-600 resize-none"
              />
            </div>

            {/* Blend Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Kar&#x131;&#x15F;&#x131;m G&uuml;c&uuml;
                </label>
                <span className="text-xs text-white font-mono bg-[#1E1E1E] px-2 py-0.5 rounded">
                  {blendStrength}%
                </span>
              </div>
              <Slider
                value={[blendStrength]}
                onValueChange={(v) => setBlendStrength(Array.isArray(v) ? v[0] : v)}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>Orijinali Koru</span>
                <span>Tam De&#x11F;i&#x15F;im</span>
              </div>
            </div>

            {/* Generate Button */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleGenerate}
                disabled={!sourceImage || isGenerating}
                className="w-full h-11 bg-[#00FF88] hover:bg-[#00E67A] text-black font-semibold text-sm rounded-lg gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    De&#x11F;i&#x15F;tiriliyor...
                  </>
                ) : (
                  <>
                    <Shuffle className="w-4 h-4" />
                    Karakteri De&#x11F;i&#x15F;tir
                  </>
                )}
              </Button>
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <Zap className="w-3 h-3 text-purple-400" />
                <span>
                  Maliyet: <strong className="text-white">8 kredi</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel - Result */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-white">Sonu&ccedil;</h2>
              <Badge
                variant="outline"
                className="text-[10px] border-[#2A2A2A] text-gray-500"
              >
                <Users className="w-3 h-3 mr-1" />
                Karakter
              </Badge>
            </div>

            {isGenerating ? (
              <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] aspect-video flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  <span className="text-sm text-gray-500">
                    Karakter de&#x11F;i&#x15F;imi uygulan&#x131;yor...
                  </span>
                </div>
              </div>
            ) : sourceImage ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original */}
                <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={sourceImage}
                      alt="Orijinal"
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] border-0">
                      Orijinal
                    </Badge>
                  </div>
                </div>

                {/* Result Placeholder */}
                <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
                  <div
                    className={cn(
                      'aspect-square bg-gradient-to-br flex items-center justify-center',
                      STYLE_PRESETS.find((s) => s.id === selectedStyle)?.gradient
                    )}
                  >
                    <div className="text-center">
                      <Users className="w-10 h-10 text-white/40 mx-auto mb-2" />
                      <p className="text-xs text-white/60">
                        {STYLE_PRESETS.find((s) => s.id === selectedStyle)?.label} stilinde
                      </p>
                    </div>
                  </div>
                  <div className="p-3 border-t border-[#2A2A2A] flex items-center justify-between">
                    <Badge className="bg-purple-500/20 text-purple-300 text-[10px] border-0">
                      {STYLE_PRESETS.find((s) => s.id === selectedStyle)?.label}
                    </Badge>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs bg-[#1E1E1E]"
                    >
                      &#x130;ndir
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#2A2A2A] bg-[#0A0A0A] aspect-video flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-600">
                  <Users className="w-10 h-10" />
                  <div className="text-center">
                    <p className="text-sm">
                      Karakter de&#x11F;i&#x15F;imi i&ccedil;in g&ouml;rsel y&uuml;kleyin
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      Bir stil se&ccedil;in ve sonu&ccedil;lar&#x131;
                      g&ouml;r&uuml;nt&uuml;leyin
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
