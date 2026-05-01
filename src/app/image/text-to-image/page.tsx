'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTaskPolling } from '@/lib/kie/useTaskPolling';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Zap,
  Image as ImageIcon,
  Loader2,
  Grid3X3,
} from 'lucide-react';

const MODELS = [
  { value: 'flux', label: 'Flux Pro', credits: 5 },
  { value: 'sdxl', label: 'Stable Diffusion XL', credits: 3 },
  { value: 'dall-e-3', label: 'DALL-E 3', credits: 8 },
];

const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1', w: 1, h: 1 },
  { value: '16:9', label: '16:9', w: 16, h: 9 },
  { value: '9:16', label: '9:16', w: 9, h: 16 },
  { value: '4:3', label: '4:3', w: 4, h: 3 },
];

const BATCH_OPTIONS = [1, 2, 4];

export default function TextToImagePage() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [model, setModel] = useState('flux');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [steps, setSteps] = useState(30);
  const [batchCount, setBatchCount] = useState(1);
  const { result, start, reset } = useTaskPolling();
  const isGenerating = result.state === 'generating' || result.state === 'waiting' || result.state === 'queuing';

  const selectedModel = MODELS.find((m) => m.value === model);
  const totalCredits = (selectedModel?.credits ?? 5) * batchCount;

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    const provider = model === 'flux' ? 'flux' : 'gpt';
    const ar = ASPECT_RATIOS.find((a) => a.value === aspectRatio);
    const size = ar ? `${ar.w * 1024}x${ar.h * 1024}` : '1024x1024';
    start({
      endpoint: '/api/generate/image',
      body: { provider, prompt, negativePrompt: negativePrompt || undefined, size, num: batchCount },
      taskType: provider === 'flux' ? 'flux' : 'gpt-image',
      onSuccess: () => reset(),
      onError: (msg) => console.error('Generation failed:', msg),
    });
  };

  const getAspectStyle = (ratio: string) => {
    const r = ASPECT_RATIOS.find((a) => a.value === ratio);
    if (!r) return { aspectRatio: '1/1' };
    return { aspectRatio: `${r.w}/${r.h}` };
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Metinden G&ouml;rsel" />

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Panel - Controls */}
          <div className="w-full lg:w-[420px] border-r border-[#2A2A2A] overflow-y-auto p-5 space-y-5">
            {/* Prompt */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Prompt
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="G&ouml;rsel a&ccedil;klaman&#x131;z&#x131; yaz&#x131;n..."
                className="min-h-[100px] bg-[#141414] border-[#2A2A2A] text-white placeholder:text-gray-600 resize-none"
              />
            </div>

            {/* Negative Prompt */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Negatif Prompt
              </label>
              <Textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="G&ouml;rmek istemedi&#x11F;in &ouml;&#x11F;eler..."
                className="min-h-[70px] bg-[#141414] border-[#2A2A2A] text-white placeholder:text-gray-600 resize-none"
              />
            </div>

            {/* Model Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Model
              </label>
              <Select value={model} onValueChange={(v) => setModel(v ?? 'flux')}>
                <SelectTrigger className="w-full bg-[#141414] border-[#2A2A2A] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E1E1E] border-[#2A2A2A]">
                  {MODELS.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="text-white">
                      <span className="flex items-center gap-2">
                        {m.label}
                        <Badge variant="outline" className="text-[10px] border-[#2A2A2A] text-gray-400">
                          {m.credits} kredi
                        </Badge>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                En-Boy Oran&#x131;
              </label>
              <div className="grid grid-cols-4 gap-2">
                {ASPECT_RATIOS.map((ar) => (
                  <button
                    key={ar.value}
                    onClick={() => setAspectRatio(ar.value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all text-xs',
                      aspectRatio === ar.value
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-[#2A2A2A] bg-[#141414] text-gray-400 hover:border-[#3A3A3A]'
                    )}
                  >
                    <div
                      className={cn(
                        'w-6 rounded-sm',
                        aspectRatio === ar.value ? 'bg-purple-500' : 'bg-[#2A2A2A]'
                      )}
                      style={{
                        aspectRatio: `${ar.w}/${ar.h}`,
                        maxWidth: 24,
                        maxHeight: 24,
                      }}
                    />
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality / Steps Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Kalite (Ad&#x131;m)
                </label>
                <span className="text-xs text-white font-mono bg-[#1E1E1E] px-2 py-0.5 rounded">
                  {steps}
                </span>
              </div>
              <Slider
                value={[steps]}
                onValueChange={(v) => setSteps(Array.isArray(v) ? v[0] : v)}
                min={10}
                max={50}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>H&#x131;zl&#x131;</span>
                <span>Y&uuml;ksek Kalite</span>
              </div>
            </div>

            {/* Batch Count */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Toplu &Uuml;retim
              </label>
              <div className="flex gap-2">
                {BATCH_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setBatchCount(n)}
                    className={cn(
                      'flex-1 py-2 rounded-lg border text-sm font-medium transition-all',
                      batchCount === n
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-[#2A2A2A] bg-[#141414] text-gray-400 hover:border-[#3A3A3A]'
                    )}
                  >
                    {n} {n === 1 ? 'G&ouml;rsel' : 'G&ouml;rsel'}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full h-11 bg-[#00FF88] hover:bg-[#00E67A] text-black font-semibold text-sm rounded-lg gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    &Uuml;retiliyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    &Uuml;ret
                  </>
                )}
              </Button>
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <Zap className="w-3 h-3 text-purple-400" />
                <span>
                  Tahmini maliyet: <strong className="text-white">{totalCredits} kredi</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel - Result Gallery */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-white">Sonu&ccedil;lar</h2>
              <Badge variant="outline" className="text-[10px] border-[#2A2A2A] text-gray-500">
                <Grid3X3 className="w-3 h-3 mr-1" />
                Galeri
              </Badge>
            </div>

            {isGenerating ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: batchCount }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-xl border border-[#2A2A2A] bg-[#141414] overflow-hidden"
                    style={getAspectStyle(aspectRatio)}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                        <span className="text-xs text-gray-500">
                          &Uuml;retiliyor... ({i + 1}/{batchCount})
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : result.state === 'success' && result.resultUrls ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.resultUrls.map((url: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-xl border border-[#2A2A2A] bg-[#141414] overflow-hidden group cursor-pointer hover:border-purple-500/40 transition-all"
                    style={getAspectStyle(aspectRatio)}
                  >
                    <img src={url} alt={`Sonu&ccedil; ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 bg-black/40">
                      <Button size="sm" variant="secondary" className="text-xs bg-[#1E1E1E]/80 backdrop-blur-sm" onClick={() => window.open(url, '_blank')}>
                        B&uuml;y&uuml;t
                      </Button>
                      <a href={url} download className="text-xs bg-[#1E1E1E]/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-white hover:bg-[#2A2A2A]">&#x130;ndir</a>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="rounded-xl border border-dashed border-[#2A2A2A] bg-[#0A0A0A] flex items-center justify-center"
                    style={getAspectStyle(aspectRatio)}
                  >
                    <div className="flex flex-col items-center gap-2 text-gray-600">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-xs">Prompt girin ve &uuml;retin</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
