'use client';

import { useState, useCallback } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTaskPolling } from '@/lib/kie/useTaskPolling';
import {
  Upload,
  Sparkles,
  Video,
  Image as ImageIcon,
  Loader2,
  X,
  Zap,
  Layers,
  AtSign,
} from 'lucide-react';

interface ReferenceItem {
  id: string;
  type: 'image' | 'video';
  file: File;
  preview: string;
  tag: string;
}

export default function OmniReferencePage() {
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [prompt, setPrompt] = useState('');

  const { result, start, reset } = useTaskPolling();

  const isGenerating = result.state === 'generating' || result.state === 'waiting' || result.state === 'queuing';

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      addFiles(files);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [references]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      addFiles(files);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [references]
  );

  const addFiles = (files: File[]) => {
    const newRefs: ReferenceItem[] = files
      .filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'))
      .map((file, i) => ({
        id: `ref-${Date.now()}-${i}`,
        type: file.type.startsWith('video/') ? 'video' as const : 'image' as const,
        file,
        preview: URL.createObjectURL(file),
        tag: `@${references.length + i + 1}`,
      }));
    setReferences((prev) => [...prev, ...newRefs]);
  };

  const removeReference = (id: string) => {
    setReferences((prev) => prev.filter((r) => r.id !== id));
  };

  const insertMention = (tag: string) => {
    setPrompt((prev) => prev + ` ${tag} `);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || references.length === 0) return;

    // Upload all reference files first
    const uploadedUrls: string[] = [];
    for (const ref of references) {
      const formData = new FormData();
      formData.append('file', ref.file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (uploadData.url) {
        uploadedUrls.push(uploadData.url);
      }
    }

    if (uploadedUrls.length === 0) return;

    start({
      endpoint: '/api/generate/video',
      body: {
        provider: 'seedance',
        prompt,
        image_urls: uploadedUrls,
      },
      taskType: 'market',
    });
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Omni Reference" subtitle="Seedance 2.0 — Çoklu referans ile video üretin" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Seedance 2.0 Banner */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Layers className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Seedance 2.0 — Omni Reference</h2>
                <p className="text-xs text-gray-500">
                  Birden fazla görsel ve video referansı ekleyin, @mention ile prompt içinde atıfta bulunun
                </p>
              </div>
              <Badge className="ml-auto bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                Yeni
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input Panel */}
            <div className="space-y-6">
              {/* Multi-Reference Upload */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  Referans Dosyaları
                </label>

                {/* Uploaded References */}
                {references.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {references.map((ref) => (
                      <div key={ref.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-[#1E1E1E] border border-[#2A2A2A]">
                          {ref.type === 'image' ? (
                            <img src={ref.preview} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-purple-500/10">
                              <Video className="w-6 h-6 text-purple-400" />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeReference(ref.id)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={() => insertMention(ref.tag)}
                          className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 rounded text-[10px] text-purple-300 font-mono hover:bg-purple-500/30 transition-colors"
                        >
                          {ref.tag}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drop Zone */}
                <div
                  onDrop={handleFileDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-[#2A2A2A] rounded-xl p-6 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer group"
                >
                  <label className="flex flex-col items-center cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-[#1E1E1E] flex items-center justify-center mb-3 group-hover:bg-purple-500/10 transition-colors">
                      <Upload className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <p className="text-sm text-gray-400 mb-1">
                      Görsel veya video sürükleyin
                    </p>
                    <p className="text-xs text-gray-600">
                      PNG, JPG, WebP, MP4 — Birden fazla dosya seçebilirsiniz
                    </p>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
              </Card>

              {/* Prompt with @mention */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <AtSign className="w-4 h-4 text-purple-400" />
                    Prompt
                  </label>
                  {references.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-600 mr-1">Ekle:</span>
                      {references.map((ref) => (
                        <button
                          key={ref.id}
                          onClick={() => insertMention(ref.tag)}
                          className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-[11px] text-purple-300 font-mono hover:bg-purple-500/20 transition-colors"
                        >
                          {ref.tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="@1 içindeki karakteri al ve @2 arka planında yürüyen bir video oluştur. Sinematik tarz, yumuşak ışık..."
                  className="bg-[#1E1E1E] border-[#2A2A2A] text-white placeholder:text-gray-600 min-h-[120px] resize-none focus:border-purple-500/50 font-mono text-sm"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-600">
                    @mention kullanarak referanslara atıfta bulunun
                  </p>
                  <p className="text-xs text-gray-600">{prompt.length}/500</p>
                </div>
              </Card>

              {/* Generate */}
              <Button
                onClick={isGenerating ? undefined : result.state !== 'idle' ? handleReset : handleGenerate}
                disabled={!prompt.trim() || references.length === 0 || isGenerating}
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
                      8 kredi
                    </span>
                  </>
                )}
              </Button>
            </div>

            {/* Right: Result */}
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
                        <p className="text-sm text-gray-300">Omni Reference işleniyor</p>
                        <p className="text-xs text-gray-600 mt-1">Referanslar analiz ediliyor...</p>
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
                    <div className="text-center p-8">
                      <Layers className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">
                        Referans dosyaları yükleyin
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        ve @mention ile prompt yazın
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* How it works */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Nasıl Çalışır?
                </h3>
                <div className="space-y-3">
                  {[
                    { step: '1', text: 'Görsel ve video referansları yükleyin' },
                    { step: '2', text: 'Prompt içinde @1, @2 ile referanslara atıfta bulunun' },
                    { step: '3', text: 'Seedance 2.0 referansları analiz eder ve birleştirir' },
                    { step: '4', text: 'Referanslardan ilham alan video üretilir' },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium flex items-center justify-center shrink-0">
                        {item.step}
                      </span>
                      <p className="text-xs text-gray-500 pt-0.5">{item.text}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
