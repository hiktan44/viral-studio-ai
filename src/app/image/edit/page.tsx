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
  ArrowLeftRight,
  Image as ImageIcon,
  X,
} from 'lucide-react';

export default function ImageEditPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [strength, setStrength] = useState(70);
  const [sliderPosition, setSliderPosition] = useState(50);
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
    if (!uploadedFile || !editPrompt.trim()) return;
    const fileUrl = await uploadFile(uploadedFile);
    start({
      endpoint: '/api/generate/image',
      body: { provider: 'gpt', prompt: editPrompt, filesUrl: [fileUrl], strength: strength / 100 },
      taskType: 'gpt-image',
      onSuccess: () => reset(),
      onError: (msg) => console.error('Edit failed:', msg),
    });
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="G&ouml;rsel D&uuml;zenleme" />

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

            {/* Edit Instructions */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                D&uuml;zenleme Talimat&#x131;
              </label>
              <Textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="Nas&#x131;l d&uuml;zenlemek istedi&#x11F;inizi a&ccedil;&#x131;klay&#x131;n..."
                className="min-h-[100px] bg-[#141414] border-[#2A2A2A] text-white placeholder:text-gray-600 resize-none"
              />
            </div>

            {/* Strength Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  D&uuml;zenleme G&uuml;c&uuml;
                </label>
                <span className="text-xs text-white font-mono bg-[#1E1E1E] px-2 py-0.5 rounded">
                  {strength}%
                </span>
              </div>
              <Slider
                value={[strength]}
                onValueChange={(v) => setStrength(Array.isArray(v) ? v[0] : v)}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>Hafif De&#x11F;i&#x15F;iklik</span>
                <span>Belirgin D&uuml;zenleme</span>
              </div>
            </div>

            {/* Generate Button */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleGenerate}
                disabled={!uploadedImage || !editPrompt.trim() || isGenerating}
                className="w-full h-11 bg-[#00FF88] hover:bg-[#00E67A] text-black font-semibold text-sm rounded-lg gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    D&uuml;zenleniyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    D&uuml;zenle
                  </>
                )}
              </Button>
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <Zap className="w-3 h-3 text-purple-400" />
                <span>
                  Maliyet: <strong className="text-white">4 kredi</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-white">
                &Ouml;nce / Sonra
              </h2>
              <Badge
                variant="outline"
                className="text-[10px] border-[#2A2A2A] text-gray-500"
              >
                <ArrowLeftRight className="w-3 h-3 mr-1" />
                Kar&#x15F;&#x131;la&#x15F;t&#x131;rma
              </Badge>
            </div>

            {isGenerating ? (
              <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] aspect-video flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  <span className="text-sm text-gray-500">
                    D&uuml;zenleme uygulan&#x131;yor...
                  </span>
                </div>
              </div>
            ) : uploadedImage ? (
              <div className="space-y-4">
                {/* Comparison Slider Placeholder */}
                <div className="relative rounded-xl border border-[#2A2A2A] overflow-hidden">
                  <div className="aspect-video relative">
                    {/* Before */}
                    <div className="absolute inset-0">
                      <img
                        src={uploadedImage}
                        alt="Orijinal"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-black/60 backdrop-blur-sm text-white text-[10px] border-0">
                          &Ouml;nce
                        </Badge>
                      </div>
                    </div>

                    {/* After (result) */}
                    <div
                      className="absolute inset-0"
                      style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                    >
                      {result.state === 'success' && result.resultUrls?.[0] ? (
                        <img src={result.resultUrls[0]} alt="Sonu&ccedil;" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-600/40 to-blue-600/40 flex items-center justify-center">
                          <Badge className="bg-black/60 backdrop-blur-sm text-white text-[10px] border-0">
                            Sonra
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Slider Line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white/80 cursor-ew-resize z-10"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <ArrowLeftRight className="w-4 h-4 text-gray-800" />
                      </div>
                    </div>

                    {/* Invisible slider control */}
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
                  Kayd&#x131;rarak &ouml;nce ve sonras&#x131;n&#x131;
                  kar&#x15F;&#x131;la&#x15F;t&#x131;r&#x131;n
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#2A2A2A] bg-[#0A0A0A] aspect-video flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-600">
                  <ImageIcon className="w-10 h-10" />
                  <div className="text-center">
                    <p className="text-sm">
                      D&uuml;zenlemek i&ccedil;in g&ouml;rsel y&uuml;kleyin
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      JPG, PNG veya WebP format&#x131;
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
