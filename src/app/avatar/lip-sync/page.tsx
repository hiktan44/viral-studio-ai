'use client';

import { useState, useCallback } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Upload,
  Sparkles,
  Video,
  Mic,
  Loader2,
  FileAudio,
  Zap,
} from 'lucide-react';

export default function LipSyncPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [audioTab, setAudioTab] = useState('audio');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [textForTts, setTextForTts] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleVideoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleAudioDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleAudioSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
    }
  }, []);

  const canGenerate = videoFile && (audioTab === 'audio' ? audioFile : textForTts.trim());

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 3000));
    setResult('generated');
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Video Dudak Senkronizasyonu" subtitle="Konuşan kişi videosuna ses senkronizasyonu uygulayın" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input */}
            <div className="space-y-6">
              {/* Video Upload */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-400" />
                  Konuşan Kişi Videosu
                </label>
                <div
                  onDrop={handleVideoDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className={cn(
                    'relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer group',
                    videoPreview
                      ? 'border-purple-500/40 bg-purple-500/5'
                      : 'border-[#2A2A2A] hover:border-purple-500/50 hover:bg-[#1E1E1E]'
                  )}
                >
                  {videoPreview ? (
                    <div className="relative p-4">
                      <video src={videoPreview} className="w-full h-44 object-cover rounded-lg" controls />
                      <button
                        onClick={() => {
                          setVideoFile(null);
                          setVideoPreview(null);
                        }}
                        className="absolute top-6 right-6 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors text-xs"
                      >
                        Kaldır
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-44 cursor-pointer">
                      <div className="w-14 h-14 rounded-2xl bg-[#1E1E1E] flex items-center justify-center mb-3 group-hover:bg-purple-500/10 transition-colors">
                        <Video className="w-6 h-6 text-gray-500 group-hover:text-purple-400 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-400 mb-1">Konuşan kişi videosu sürükleyin</p>
                      <p className="text-xs text-gray-600">MP4, WebM — Yüz net görünmeli</p>
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
                    </label>
                  )}
                </div>
              </Card>

              {/* Audio Input: Tabbed (Audio File / Text) */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                  <Mic className="w-4 h-4 text-purple-400" />
                  Ses Girişi
                </label>
                <Tabs value={audioTab} onValueChange={setAudioTab}>
                  <TabsList className="bg-[#1E1E1E] border border-[#2A2A2A] mb-4">
                    <TabsTrigger
                      value="audio"
                      className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-gray-500 text-xs"
                    >
                      <FileAudio className="w-3 h-3 mr-1.5" />
                      Ses Dosyası
                    </TabsTrigger>
                    <TabsTrigger
                      value="text"
                      className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-gray-500 text-xs"
                    >
                      <Mic className="w-3 h-3 mr-1.5" />
                      Metin (TTS)
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="audio">
                    <div
                      onDrop={handleAudioDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className={cn(
                        'relative border-2 border-dashed rounded-xl transition-all cursor-pointer group',
                        audioFile
                          ? 'border-purple-500/40 bg-purple-500/5'
                          : 'border-[#2A2A2A] hover:border-purple-500/50 hover:bg-[#1E1E1E]'
                      )}
                    >
                      {audioFile ? (
                        <div className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <FileAudio className="w-5 h-5 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{audioFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                          </div>
                          {audioPreview && <audio src={audioPreview} controls className="h-8 w-32" />}
                          <button
                            onClick={() => {
                              setAudioFile(null);
                              setAudioPreview(null);
                            }}
                            className="p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors text-xs"
                          >
                            Kaldır
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-28 cursor-pointer">
                          <FileAudio className="w-6 h-6 text-gray-500 group-hover:text-purple-400 mb-2 transition-colors" />
                          <p className="text-sm text-gray-400 mb-0.5">Ses dosyası sürükleyin</p>
                          <p className="text-xs text-gray-600">MP3, WAV, OGG</p>
                          <input type="file" accept="audio/*" className="hidden" onChange={handleAudioSelect} />
                        </label>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="text">
                    <Textarea
                      value={textForTts}
                      onChange={(e) => setTextForTts(e.target.value)}
                      placeholder="Merhaba, bu bir test seslendirmesidir. Yapay zeka bu metni sese dönüştürecek ve dudak senkronizasyonu uygulayacak..."
                      className="bg-[#1E1E1E] border-[#2A2A2A] text-white placeholder:text-gray-600 min-h-[100px] resize-none focus:border-purple-500/50"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      {textForTts.length}/1000 karakter — Metin otomatik olarak sese dönüştürülür
                    </p>
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Generate */}
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
                className="w-full h-12 bg-[#00FF88] hover:bg-[#00DD77] text-black font-semibold text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Senkronize ediliyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Dudak Senkronizasyonu Uygula
                    <span className="ml-3 px-2 py-0.5 bg-black/20 rounded-full text-xs">12 kredi</span>
                  </>
                )}
              </Button>
            </div>

            {/* Right: Result */}
            <div className="space-y-6">
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Sonuç
                  </label>
                  {result && (
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
                        <p className="text-sm text-gray-300">Dudak senkronizasyonu</p>
                        <p className="text-xs text-gray-600 mt-1">Yüz ifadeleri analiz ediliyor...</p>
                      </div>
                    </div>
                  ) : result ? (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 via-[#141414] to-[#00FF88]/10 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                          <Video className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-sm text-gray-300">Senkronize video</p>
                        <p className="text-xs text-gray-500 mt-1">Dudak hareketleri ses ile eşleştirildi</p>
                        <div className="flex items-center gap-2 mt-4 justify-center">
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs">
                            İndir
                          </Button>
                          <Button size="sm" variant="outline" className="border-[#2A2A2A] text-gray-300 hover:text-white rounded-lg text-xs">
                            Paylaş
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <Mic className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Video ve ses yükleyin</p>
                      <p className="text-xs text-gray-700 mt-1">Sonuç burada görünecek</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Tips */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  İpuçları
                </h3>
                <ul className="space-y-2">
                  {[
                    'Videodaki kişinin yüzü net ve aydınlık olmalı',
                    'Başlangıçta ağız kapalı pozisyonda olması en iyi sonucu verir',
                    'Ses dosyası temiz ve gürültüsüz olmalı',
                    'TTS seçeneği ile kendi yazdığınız metni söyletebilirsiniz',
                  ].map((tip, i) => (
                    <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                      <Sparkles className="w-3 h-3 text-purple-500 mt-0.5 shrink-0" />
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
