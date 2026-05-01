'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Sparkles,
  Zap,
  Loader2,
  Maximize2,
  Image as ImageIcon,
  X,
  ArrowUpRight,
  SlidersHorizontal,
} from 'lucide-react';

const SCALE_OPTIONS = [
  { value: 2, label: '2x', credits: 3, desc: '512 &rarr; 1024' },
  { value: 4, label: '4x', credits: 8, desc: '512 &rarr; 2048' },
];

export default function UpscalePage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [scale, setScale] = useState(2);
  const [sharpening, setSharpening] = useState(true);
  const [denoise, setDenoise] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedImage(URL.createObjectURL(file));
  };

  const handleGenerate = () => {
    if (!uploadedImage) return;
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  const selectedScale = SCALE_OPTIONS.find((s) => s.value === scale);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="G&ouml;rsel B&uuml;y&uuml;tme" />

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
                    alt="Kaynak"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-black/60 backdrop-blur-sm text-white text-[10px] border-0">
                      Orijinal Boyut
                    </Badge>
                  </div>
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
                    <p className="text-sm text-gray-400">B&uuml;y&uuml;t&uuml;lecek g&ouml;rsel</p>
                    <p className="text-xs text-gray-600 mt-1">
                      D&uuml;&#x15F;&uuml;k &ccedil;&ouml;z&uuml;n&uuml;rl&uuml;kl&uuml;
                      g&ouml;rseller i&ccedil;in ideal
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* Scale Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                B&uuml;y&uuml;tme Oran&#x131;
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SCALE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setScale(opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                      scale === opt.value
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-[#2A2A2A] bg-[#141414] hover:border-[#3A3A3A]'
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center gap-1 text-2xl font-bold',
                        scale === opt.value ? 'text-white' : 'text-gray-400'
                      )}
                    >
                      <ArrowUpRight className="w-5 h-5" />
                      {opt.label}
                    </div>
                    <span
                      className={cn(
                        'text-xs',
                        scale === opt.value ? 'text-gray-300' : 'text-gray-500'
                      )}
                      dangerouslySetInnerHTML={{ __html: opt.desc }}
                    />
                    <Badge
                      variant="outline"
                      className="text-[10px] border-[#2A2A2A] text-gray-500"
                    >
                      {opt.credits} kredi
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Sharpening Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#2A2A2A] bg-[#141414]">
                <div>
                  <p className="text-sm text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                    AI Keskinle&#x15F;tirme
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Detaylar&#x131; yapay zeka ile keskinle&#x15F;tir
                  </p>
                </div>
                <Switch checked={sharpening} onCheckedChange={setSharpening} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[#2A2A2A] bg-[#141414]">
                <div>
                  <p className="text-sm text-white">G&uuml;r&uuml;lt&uuml; Azaltma</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Dijital g&uuml;r&uuml;lt&uuml; ve artefaktlar&#x131; temizle
                  </p>
                </div>
                <Switch checked={denoise} onCheckedChange={setDenoise} />
              </div>
            </div>

            {/* Generate Button */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleGenerate}
                disabled={!uploadedImage || isGenerating}
                className="w-full h-11 bg-[#00FF88] hover:bg-[#00E67A] text-black font-semibold text-sm rounded-lg gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    B&uuml;y&uuml;t&uuml;l&uuml;yor...
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    {scale}x B&uuml;y&uuml;t
                  </>
                )}
              </Button>
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <Zap className="w-3 h-3 text-purple-400" />
                <span>
                  Maliyet: <strong className="text-white">{selectedScale?.credits ?? 3} kredi</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel - Comparison */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-white">
                Kar&#x15F;&#x131;la&#x15F;t&#x131;rma
              </h2>
              <Badge variant="outline" className="text-[10px] border-[#2A2A2A] text-gray-500">
                <Maximize2 className="w-3 h-3 mr-1" />
                {scale}x
              </Badge>
            </div>

            {isGenerating ? (
              <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] aspect-video flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  <span className="text-sm text-gray-500">
                    G&ouml;rsel b&uuml;y&uuml;t&uuml;l&uuml;yor...
                  </span>
                </div>
              </div>
            ) : uploadedImage ? (
              <div className="space-y-4">
                {/* Before/After Slider */}
                <div className="relative rounded-xl border border-[#2A2A2A] overflow-hidden">
                  <div className="aspect-video relative">
                    {/* Before (blurred/pixelated to simulate low-res) */}
                    <div className="absolute inset-0">
                      <img
                        src={uploadedImage}
                        alt="D&uuml;&#x15F;&uuml;k &ccedil;&ouml;z&uuml;n&uuml;rl&uuml;k"
                        className="w-full h-full object-cover"
                        style={{ filter: 'blur(0px)' }}
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-black/60 backdrop-blur-sm text-white text-[10px] border-0">
                          Orijinal
                        </Badge>
                      </div>
                    </div>

                    {/* After (upscaled placeholder) */}
                    <div
                      className="absolute inset-0"
                      style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-emerald-600/30 flex items-center justify-center">
                        <div className="text-center">
                          <Maximize2 className="w-8 h-8 text-white/40 mx-auto mb-2" />
                          <p className="text-xs text-white/60">{scale}x Y&uuml;kseltilmi&#x15F;</p>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-[#00FF88]/20 text-emerald-300 text-[10px] border-0">
                          {scale}x
                        </Badge>
                      </div>
                    </div>

                    {/* Slider */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-10"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg cursor-ew-resize">
                        <ArrowUpRight className="w-4 h-4 text-gray-800" />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Kayd&#x131;rarak orijinal ve b&uuml;y&uuml;t&uuml;lm&uuml;&#x15F;
                  versiyonu kar&#x15F;&#x131;la&#x15F;t&#x131;r&#x131;n
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#2A2A2A] bg-[#0A0A0A] aspect-video flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-600">
                  <Maximize2 className="w-10 h-10" />
                  <div className="text-center">
                    <p className="text-sm">
                      B&uuml;y&uuml;t&uuml;lecek g&ouml;rsel y&uuml;kleyin
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      &Ouml;nce / sonra kar&#x15F;&#x131;la&#x15F;t&#x131;rmalar&#x131;
                      burada g&ouml;r&uuml;nt&uuml;lenecek
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
