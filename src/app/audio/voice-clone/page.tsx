'use client';

import { useState, useCallback } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTaskPolling } from '@/lib/kie/useTaskPolling';
import {
  Upload,
  Sparkles,
  Loader2,
  Mic,
  Play,
  Pause,
  Download,
  FileAudio,
  Wand2,
  Zap,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function VoiceClonePage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [isCloned, setIsCloned] = useState(false);
  const [clonedAudioUrl, setClonedAudioUrl] = useState<string | null>(null);
  const [newText, setNewText] = useState('');
  const [isPlayingSource, setIsPlayingSource] = useState(false);
  const [isPlayingResult, setIsPlayingResult] = useState(false);
  const { result, start, reset } = useTaskPolling();

  const isGenerating = result.state === 'waiting' || result.state === 'queuing' || result.state === 'generating';

  const handleAudioDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
      setIsCloned(false);
      setClonedAudioUrl(null);
      reset();
    }
  }, [reset]);

  const handleAudioSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
      setIsCloned(false);
      setClonedAudioUrl(null);
      reset();
    }
  }, [reset]);

  const handleClone = async () => {
    if (!audioFile) return;
    setIsCloning(true);
    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (uploadData.url) {
        setClonedAudioUrl(uploadData.url);
        setIsCloned(true);
      }
    } finally {
      setIsCloning(false);
    }
  };

  const handleGenerate = async () => {
    if (!newText.trim() || !isCloned || !clonedAudioUrl) return;

    start({
      endpoint: '/api/generate/tts',
      body: {
        text: newText,
        voice: clonedAudioUrl,
        language_code: 'tr',
      },
      taskType: 'market',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Anında Ses Klonlama" subtitle="Sesinizi klonlayın ve istediğiniz metni söyletin" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input */}
            <div className="space-y-6">
              {/* Step 1: Audio Upload */}
              <Card className={cn(
                'bg-[#141414] border p-5 transition-colors',
                isCloned ? 'border-[#00FF88]/30' : 'border-[#2A2A2A]'
              )}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn(
                    'w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center',
                    isCloned ? 'bg-[#00FF88]/20 text-[#00FF88]' : 'bg-purple-500/20 text-purple-400'
                  )}>
                    {isCloned ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                  </span>
                  <label className="text-sm font-medium text-gray-300">
                    Ses Örneği Yükle
                  </label>
                  <span className="text-[10px] text-gray-600 ml-auto">Min. 10 saniye</span>
                </div>

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
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <FileAudio className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{audioFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(audioFile.size)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsPlayingSource(!isPlayingSource);
                          }}
                          className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-colors"
                        >
                          {isPlayingSource ? (
                            <Pause className="w-3 h-3 text-white" />
                          ) : (
                            <Play className="w-3 h-3 text-white ml-0.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAudioFile(null);
                            setAudioPreview(null);
                            setIsCloned(false);
                            setClonedAudioUrl(null);
                            reset();
                          }}
                          className="p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors text-xs"
                        >
                          Kaldır
                        </button>
                      </div>
                      {/* Waveform placeholder */}
                      <div className="h-12 rounded-lg bg-[#1E1E1E] flex items-center justify-center">
                        <div className="flex items-center gap-[2px]">
                          {Array.from({ length: 50 }, (_, i) => (
                            <div
                              key={i}
                              className="w-1 bg-purple-500/40 rounded-full"
                              style={{ height: `${Math.random() * 30 + 5}px` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-36 cursor-pointer">
                      <div className="w-14 h-14 rounded-2xl bg-[#1E1E1E] flex items-center justify-center mb-3 group-hover:bg-purple-500/10 transition-colors">
                        <Mic className="w-6 h-6 text-gray-500 group-hover:text-purple-400 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-400 mb-1">Ses dosyası sürükleyin</p>
                      <p className="text-xs text-gray-600">MP3, WAV, OGG, M4A — Min 10 saniye</p>
                      <input type="file" accept="audio/*" className="hidden" onChange={handleAudioSelect} />
                    </label>
                  )}
                </div>

                {/* Clone Button */}
                {audioFile && !isCloned && (
                  <Button
                    onClick={handleClone}
                    disabled={isCloning}
                    className="w-full h-11 mt-4 bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm rounded-xl transition-all"
                  >
                    {isCloning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Ses Analiz Ediliyor...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Sesi Klonla
                      </>
                    )}
                  </Button>
                )}

                {isCloning && (
                  <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                      <p className="text-xs text-purple-300">
                        Ses özellikleri çıkarılıyor, lütfen bekleyin...
                      </p>
                    </div>
                  </div>
                )}

                {isCloned && (
                  <div className="mt-4 p-3 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00FF88]" />
                      <p className="text-xs text-[#00FF88]">
                        Ses başarıyla klonlandı! Artık metin yazabilirsiniz.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Step 2: Text Input for Cloned Voice */}
              <Card className={cn(
                'bg-[#141414] border p-5 transition-colors',
                isCloned ? 'border-[#2A2A2A]' : 'border-[#2A2A2A]/50 opacity-60'
              )}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn(
                    'w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center',
                    isCloned ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-600'
                  )}>
                    2
                  </span>
                  <label className="text-sm font-medium text-gray-300">
                    Yeni Metin Yaz
                  </label>
                </div>
                <Textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder={isCloned ? "Klonlanan sesle söyletmek istediğiniz metni yazın..." : "Önce ses klonlayın..."}
                  disabled={!isCloned}
                  className="bg-[#1E1E1E] border-[#2A2A2A] text-white placeholder:text-gray-600 min-h-[100px] resize-none focus:border-purple-500/50 disabled:opacity-50"
                />
                <p className="text-xs text-gray-600 mt-2">{newText.length}/1000 karakter</p>
              </Card>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!isCloned || !newText.trim() || isGenerating}
                className="w-full h-12 bg-[#00FF88] hover:bg-[#00DD77] text-black font-semibold text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Klonlanan sesle oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Klonlanmış Sesle Oluştur
                    <span className="ml-3 px-2 py-0.5 bg-black/20 rounded-full text-xs">5 kredi</span>
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
                    Klonlanmış Ses Sonucu
                  </label>
                  {result.state === 'success' && (
                    <span className="text-xs text-[#00FF88] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" />
                      Hazır
                    </span>
                  )}
                  {result.state === 'fail' && (
                    <span className="text-xs text-red-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      Hata
                    </span>
                  )}
                </div>

                {isGenerating ? (
                  <div className="h-48 rounded-xl bg-[#1E1E1E] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-purple-500/20" />
                        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-300">Klonlanmış ses üretiliyor</p>
                        <p className="text-xs text-gray-600 mt-1">Ses tonu uygulanıyor...</p>
                      </div>
                    </div>
                  </div>
                ) : result.state === 'success' && result.resultUrls?.length ? (
                  <div className="space-y-4">
                    {/* Cloned Audio Waveform */}
                    <div className="h-24 rounded-xl bg-gradient-to-r from-purple-500/20 via-[#1E1E1E] to-[#00FF88]/10 flex items-center justify-center border border-[#2A2A2A]">
                      <div className="flex items-center gap-[3px]">
                        {Array.from({ length: 40 }, (_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-[#00FF88]/60 rounded-full"
                            style={{ height: `${Math.random() * 50 + 10}px` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Player */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A]">
                      <button
                        onClick={() => setIsPlayingResult(!isPlayingResult)}
                        className="w-10 h-10 rounded-full bg-[#00FF88] hover:bg-[#00DD77] flex items-center justify-center transition-colors"
                      >
                        {isPlayingResult ? (
                          <Pause className="w-4 h-4 text-black" />
                        ) : (
                          <Play className="w-4 h-4 text-black ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <audio src={result.resultUrls[0]} className="w-full h-8" controls />
                      </div>
                      <a href={result.resultUrls[0]} download>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#2A2A2A] text-gray-300 hover:text-white rounded-lg h-8"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          <span className="text-xs">MP3</span>
                        </Button>
                      </a>
                    </div>

                    {/* Info */}
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <p className="text-[10px] text-gray-500">Orijinal Ses</p>
                        <p className="text-xs text-white mt-0.5 truncate">{audioFile?.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Kullanılan Metin</p>
                        <p className="text-xs text-white mt-0.5 truncate">{newText.slice(0, 30)}...</p>
                      </div>
                    </div>
                  </div>
                ) : result.state === 'fail' ? (
                  <div className="h-48 rounded-xl bg-[#1E1E1E] flex items-center justify-center">
                    <div className="text-center p-8">
                      <p className="text-sm text-red-400">{result.failMsg}</p>
                      <Button size="sm" variant="outline" onClick={reset} className="mt-3 border-[#2A2A2A] text-gray-300 hover:text-white rounded-lg text-xs">
                        Tekrar Dene
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 rounded-xl bg-gradient-to-br from-[#1E1E1E] via-[#141414] to-[#1E1E1E] flex items-center justify-center border border-[#2A2A2A]">
                    <div className="text-center">
                      <Mic className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Ses yükleyin ve klonlayın</p>
                      <p className="text-xs text-gray-700 mt-1">Sonuç burada görünecek</p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Process Steps */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Nasıl Çalışır?
                </h3>
                <div className="space-y-3">
                  {[
                    { step: '1', text: 'En az 10 saniyelik bir ses örneği yükleyin', done: !!audioFile },
                    { step: '2', text: '"Sesi Klonla" butonuna tıklayın', done: isCloned },
                    { step: '3', text: 'Klonlanan sesle söyletmek istediğiniz metni yazın', done: !!newText },
                    { step: '4', text: '"Oluştur" ile klonlanmış sesi üretin', done: !!result },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <span className={cn(
                        'w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center shrink-0',
                        item.done
                          ? 'bg-[#00FF88]/20 text-[#00FF88]'
                          : 'bg-[#1E1E1E] text-gray-500'
                      )}>
                        {item.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : item.step}
                      </span>
                      <p className={cn('text-xs pt-0.5', item.done ? 'text-gray-300' : 'text-gray-500')}>
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Tips */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  İpuçları
                </h3>
                <ul className="space-y-2">
                  {[
                    'Daha uzun ses örnekleri daha iyi klonlama kalitesi sağlar',
                    'Arka plan gürültüsü olmayan temiz sesler kullanın',
                    'Tek bir konuşmacının sesini yükleyin',
                    'Klonlama bir kez yapıldıktan sonra farklı metinler deneyebilirsiniz',
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
