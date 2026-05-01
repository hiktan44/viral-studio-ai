'use client';

import { useState, useCallback } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  Upload,
  Sparkles,
  Video,
  Loader2,
  Zap,
  Gauge,
  Maximize2,
  ArrowUpFromLine,
} from 'lucide-react';

const SCALE_OPTIONS = [
  { value: '2x', label: '2x', desc: 'Çözünürlüğü ikiye katla', credits: 3 },
  { value: '4x', label: '4x', desc: 'Çözünürlüğü dörde katla', credits: 6 },
];

export default function VideoUpscalePage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [scale, setScale] = useState('2x');
  const [fpsIncrease, setFpsIncrease] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleVideoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      if (file.size > 100 * 1024 * 1024) return; // 100MB limit
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) return;
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleGenerate = async () => {
    if (!videoFile) return;
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 3000));
    setResult('generated');
    setIsGenerating(false);
  };

  const selectedScale = SCALE_OPTIONS.find((s) => s.value === scale);
  const creditCost = (selectedScale?.credits || 3) + (fpsIncrease ? 2 : 0);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Video Büyütme" subtitle="Videonuzun çözünürlüğünü ve FPS değerini artırın" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input */}
            <div className="space-y-6">
              {/* Video Upload */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                  <Upload className="w-4 h-4 text-purple-400" />
                  Video Yükle
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
                      <video
                        src={videoPreview}
                        className="w-full h-48 object-cover rounded-lg"
                        controls
                      />
                      <div className="absolute top-6 right-6 flex items-center gap-2">
                        <span className="px-2 py-1 bg-black/60 rounded text-[11px] text-gray-300">
                          {videoFile && formatFileSize(videoFile.size)}
                        </span>
                        <button
                          onClick={() => {
                            setVideoFile(null);
                            setVideoPreview(null);
                          }}
                          className="p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors text-xs"
                        >
                          Kaldır
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                      <div className="w-14 h-14 rounded-2xl bg-[#1E1E1E] flex items-center justify-center mb-3 group-hover:bg-purple-500/10 transition-colors">
                        <Video className="w-6 h-6 text-gray-500 group-hover:text-purple-400 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-400 mb-1">
                        Video sürükleyin veya tıklayın
                      </p>
                      <p className="text-xs text-gray-600">MP4, MOV, WebM — Max 100MB</p>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleVideoSelect}
                      />
                    </label>
                  )}
                </div>
              </Card>

              {/* Scale Options */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-purple-400" />
                  Ölçek Faktörü
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {SCALE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setScale(opt.value)}
                      className={cn(
                        'p-4 rounded-xl border transition-all text-center',
                        scale === opt.value
                          ? 'border-purple-500/60 bg-purple-500/10'
                          : 'border-[#2A2A2A] bg-[#1E1E1E] hover:border-[#3A3A3A]'
                      )}
                    >
                      <p className={cn('text-2xl font-bold', scale === opt.value ? 'text-purple-400' : 'text-gray-400')}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                      <p className="text-xs text-gray-600 mt-2">{opt.credits} kredi</p>
                    </button>
                  ))}
                </div>
              </Card>

              {/* FPS Increase Toggle */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1E1E1E] flex items-center justify-center">
                      <Gauge className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-300">FPS Artır</p>
                      <p className="text-xs text-gray-600">24 FPS → 60 FPS arası enterpolasyon</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600">+2 kredi</span>
                    <Switch
                      checked={fpsIncrease}
                      onCheckedChange={setFpsIncrease}
                      className="data-[state=checked]:bg-purple-500"
                    />
                  </div>
                </div>
                {fpsIncrease && (
                  <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <p className="text-xs text-purple-300">
                      FPS artırma, düşük kare hızlı videoları akıcı hale getirir. Özellikle animasyon ve hızlı hareket içeren içeriklerde etkilidir.
                    </p>
                  </div>
                )}
              </Card>

              {/* Generate */}
              <Button
                onClick={handleGenerate}
                disabled={!videoFile || isGenerating}
                className="w-full h-12 bg-[#00FF88] hover:bg-[#00DD77] text-black font-semibold text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    İşleniyor...
                  </>
                ) : (
                  <>
                    <ArrowUpFromLine className="w-4 h-4 mr-2" />
                    Videoyu Büyüt
                    <span className="ml-3 px-2 py-0.5 bg-black/20 rounded-full text-xs">
                      {creditCost} kredi
                    </span>
                  </>
                )}
              </Button>
            </div>

            {/* Right: Result */}
            <div className="space-y-6">
              {/* Before / After comparison placeholder */}
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

                {isGenerating ? (
                  <div className="aspect-video rounded-xl bg-[#1E1E1E] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-purple-500/20" />
                        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-300">Video büyütülüyor</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {scale} ölçekleme{fpsIncrease ? ' + FPS artırma' : ''} uygulanıyor
                        </p>
                      </div>
                    </div>
                  </div>
                ) : result ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-2 text-center">Önce</p>
                        <div className="aspect-video rounded-lg bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] flex items-center justify-center border border-[#2A2A2A]">
                          <div className="text-center">
                            <Video className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                            <p className="text-[10px] text-gray-600">Orijinal</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-purple-400 mb-2 text-center">Sonra ({scale})</p>
                        <div className="aspect-video rounded-lg bg-gradient-to-br from-purple-500/20 to-[#00FF88]/10 flex items-center justify-center border border-purple-500/30">
                          <div className="text-center">
                            <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                            <p className="text-[10px] text-purple-300">Yüksek Çözünürlük</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs">
                        İndir
                      </Button>
                      <Button size="sm" variant="outline" className="border-[#2A2A2A] text-gray-300 hover:text-white rounded-lg text-xs">
                        Karşılaştır
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-[#1E1E1E] via-[#141414] to-[#1E1E1E] flex items-center justify-center border border-[#2A2A2A]">
                    <div className="text-center">
                      <ArrowUpFromLine className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">
                        Video yükleyin ve ölçek seçin
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        Sonuç burada görünecek
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Info */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Bilgi
                </h3>
                <ul className="space-y-2">
                  {[
                    '2x ölçekleme: 720p → 1440p, 1080p → 4K',
                    '4x ölçekleme: 720p → 4K, 1080p → 8K',
                    'FPS artırma: AI tabanlı kare enterpolasyonu',
                    'Max dosya boyutu: 100MB',
                    'Desteklenen formatlar: MP4, MOV, WebM',
                  ].map((item, i) => (
                    <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                      {item}
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
