'use client';

import { useState, useCallback } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTaskPolling } from '@/lib/kie/useTaskPolling';
import {
  Upload,
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Video,
  Loader2,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';

const MODELS = [
  { value: 'seedance-2.0', label: 'Seedance 2.0', credits: 5, provider: 'seedance' as const },
  { value: 'wan', label: 'Wan 2.1', credits: 4, provider: 'seedance' as const },
  { value: 'kling', label: 'Kling 2.0', credits: 6, provider: 'kling' as const },
];

const DURATIONS = [
  { value: '5', label: '5 saniye' },
  { value: '10', label: '10 saniye' },
];

export default function ImageToVideoPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('seedance-2.0');
  const [motionDensity, setMotionDensity] = useState([50]);
  const [duration, setDuration] = useState('5');

  const { result, start, reset } = useTaskPolling();

  const isGenerating = result.state === 'generating' || result.state === 'waiting' || result.state === 'queuing';

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const handleGenerate = async () => {
    if (!imageFile || !prompt.trim()) return;

    // 1. Upload image first
    const formData = new FormData();
    formData.append('file', imageFile);
    const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
    const uploadData = await uploadRes.json();
    if (!uploadData.url) return;

    const selectedModel = MODELS.find((m) => m.value === model);
    const provider = selectedModel?.provider ?? 'seedance';

    start({
      endpoint: '/api/generate/video',
      body: {
        provider,
        prompt: `${prompt} (hareket yoğunluğu: ${motionDensity[0]}%)`,
        image_urls: [uploadData.url],
        duration: Number(duration),
      },
      taskType: 'market',
    });
  };

  const handleReset = () => {
    reset();
  };

  const selectedModel = MODELS.find((m) => m.value === model);
  const creditCost = selectedModel ? selectedModel.credits * (duration === '10' ? 2 : 1) : 5;

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Görselden Video" subtitle="Bir görseli hareketli videoya dönüştürün" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input Panel */}
            <div className="space-y-6">
              {/* Image Upload */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block">
                  Kaynak Görsel
                </label>
                <div
                  onDrop={handleImageDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className={cn(
                    'relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer group',
                    imagePreview
                      ? 'border-purple-500/40 bg-purple-500/5'
                      : 'border-[#2A2A2A] hover:border-purple-500/50 hover:bg-[#1E1E1E]'
                  )}
                >
                  {imagePreview ? (
                    <div className="relative p-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-6 right-6 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors text-xs"
                      >
                        Kaldır
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                      <div className="w-14 h-14 rounded-2xl bg-[#1E1E1E] flex items-center justify-center mb-3 group-hover:bg-purple-500/10 transition-colors">
                        <ImageIcon className="w-6 h-6 text-gray-500 group-hover:text-purple-400 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-400 mb-1">
                        Görsel sürükleyin veya tıklayın
                      </p>
                      <p className="text-xs text-gray-600">PNG, JPG, WebP - Max 10MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                    </label>
                  )}
                </div>
              </Card>

              {/* Motion Prompt */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block">
                  Hareket Promptu
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Kamerayı yavaşça yaklaştır, rüzgar saçları savundur, arka planda ışık parlamaları..."
                  className="bg-[#1E1E1E] border-[#2A2A2A] text-white placeholder:text-gray-600 min-h-[100px] resize-none focus:border-purple-500/50"
                />
                <p className="text-xs text-gray-600 mt-2">
                  {prompt.length}/500 karakter
                </p>
              </Card>

              {/* Settings Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Model Selector */}
                <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                  <label className="text-sm font-medium text-gray-300 mb-3 block">
                    Model
                  </label>
                  <Select value={model} onValueChange={(v) => setModel(v ?? 'seedance-2.0')}>
                    <SelectTrigger className="bg-[#1E1E1E] border-[#2A2A2A] text-white focus:border-purple-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E1E1E] border-[#2A2A2A]">
                      {MODELS.map((m) => (
                        <SelectItem key={m.value} value={m.value} className="text-white focus:bg-[#2A2A2A] focus:text-white">
                          {m.label} <span className="text-gray-500 ml-2">{m.credits} kredi</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Card>

                {/* Duration */}
                <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                  <label className="text-sm font-medium text-gray-300 mb-3 block">
                    Süre
                  </label>
                  <Select value={duration} onValueChange={(v) => setDuration(v ?? '5')}>
                    <SelectTrigger className="bg-[#1E1E1E] border-[#2A2A2A] text-white focus:border-purple-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E1E1E] border-[#2A2A2A]">
                      {DURATIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value} className="text-white focus:bg-[#2A2A2A] focus:text-white">
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Card>
              </div>

              {/* Motion Density Slider */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                    Hareket Yoğunluğu
                  </label>
                  <span className="text-sm text-purple-400 font-medium">{motionDensity[0]}%</span>
                </div>
                <Slider
                  value={motionDensity}
                  onValueChange={(v) => setMotionDensity(Array.isArray(v) ? v : [v])}
                  min={0}
                  max={100}
                  step={5}
                  className="[&_[role=slider]]:bg-purple-500 [&_[role=slider]]:border-purple-400"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-600">Hafif</span>
                  <span className="text-xs text-gray-600">Yoğun</span>
                </div>
              </Card>

              {/* Generate Button */}
              <Button
                onClick={isGenerating ? undefined : result.state !== 'idle' ? handleReset : handleGenerate}
                disabled={!imageFile || !prompt.trim() || isGenerating}
                className="w-full h-12 bg-[#00FF88] hover:bg-[#00DD77] text-black font-semibold text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : result.state !== 'idle' ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Yeni Video Oluştur
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Video Oluştur
                    <span className="ml-3 px-2 py-0.5 bg-black/20 rounded-full text-xs">
                      {creditCost} kredi
                    </span>
                  </>
                )}
              </Button>
            </div>

            {/* Right: Result Preview */}
            <div className="space-y-6">
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-400" />
                    Sonuç
                  </label>
                  {result.state === 'success' && (
                    <span className="text-xs text-[#00FF88] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" />
                      Hazır
                    </span>
                  )}
                </div>
                <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-[#1E1E1E] via-[#141414] to-[#1E1E1E] flex items-center justify-center border border-[#2A2A2A]">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-purple-500/20" />
                        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-300">Video oluşturuluyor</p>
                        <p className="text-xs text-gray-600 mt-1">Tahmini 30-60 saniye</p>
                      </div>
                    </div>
                  ) : result.state === 'success' && result.resultUrls?.length ? (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <video
                        src={result.resultUrls[0]}
                        controls
                        className="w-full h-full rounded-lg object-contain"
                      />
                    </div>
                  ) : result.state === 'fail' ? (
                    <div className="text-center p-8">
                      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                        <span className="text-red-400 text-xl">!</span>
                      </div>
                      <p className="text-sm text-red-400">Oluşturma başarısız</p>
                      <p className="text-xs text-gray-600 mt-1">{result.failMsg}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">
                        Video oluşturmak için görsel yükleyin
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        ve prompt girin
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Tips Card */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-purple-400" />
                  İpuçları
                </h3>
                <ul className="space-y-2">
                  {[
                    'Yüksek çözünürlüklü görseller daha iyi sonuç verir',
                    'Hareket yönünü açıkça belirtin (yakınlaştır, uzaklaştır, sola kaydır)',
                    'Seedance 2.0 en yeni model, en iyi kaliteyi sunar',
                    '10 saniyelik videolar daha fazla kredi gerektirir',
                  ].map((tip, i) => (
                    <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                      <Zap className="w-3 h-3 text-purple-500 mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
