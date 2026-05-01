'use client';

import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Video,
  Loader2,
  Camera,
  Palette,
  Monitor,
  Clock,
  Zap,
  Wand2,
  Clapperboard,
} from 'lucide-react';

const CAMERA_MOTIONS = [
  { value: 'zoom-in', label: 'Yakınlaştır', icon: '🔍' },
  { value: 'zoom-out', label: 'Uzaklaştır', icon: '🔎' },
  { value: 'pan-left', label: 'Sola Kaydır', icon: '⬅️' },
  { value: 'pan-right', label: 'Sağa Kaydır', icon: '➡️' },
  { value: 'tilt-up', label: 'Yukarı Bak', icon: '⬆️' },
  { value: 'tilt-down', label: 'Aşağı Bak', icon: '⬇️' },
  { value: 'orbit', label: 'Yörünge', icon: '🔄' },
  { value: 'dolly', label: 'Dolly', icon: '🎬' },
];

const STYLES = [
  { value: 'cinematic', label: 'Sinematik', desc: 'Film kalitesinde, derin alan' },
  { value: 'cartoon', label: 'Çizgi Film', desc: 'Animasyon tarzı, renkli' },
  { value: 'documentary', label: 'Belgesel', desc: 'Gerçekçi, doğal ışık' },
  { value: 'anime', label: 'Anime', desc: 'Japon animasyon stili' },
  { value: '3d-render', label: '3D Render', desc: 'CGI, 3 boyutlu' },
  { value: 'watercolor', label: 'Suluboya', desc: 'Sanatsal, yumuşak' },
];

const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9', desc: 'Yatay' },
  { value: '9:16', label: '9:16', desc: 'Dikey' },
  { value: '1:1', label: '1:1', desc: 'Kare' },
  { value: '4:3', label: '4:3', desc: 'Klasik' },
];

const DURATIONS = [
  { value: '5', label: '5 sn', credits: 5 },
  { value: '10', label: '10 sn', credits: 10 },
  { value: '15', label: '15 sn', credits: 15 },
];

export default function TextToVideoPage() {
  const [prompt, setPrompt] = useState('');
  const [cameraMotion, setCameraMotion] = useState('zoom-in');
  const [style, setStyle] = useState('cinematic');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState('5');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 3000));
    setResult('generated');
    setIsGenerating(false);
  };

  const creditCost = DURATIONS.find((d) => d.value === duration)?.credits || 5;

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Metinden Video" subtitle="Yazdığınız metin ile video oluşturun" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input Panel */}
            <div className="space-y-6">
              {/* Prompt Textarea */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-purple-400" />
                  Video Prompt
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Altın saatte bir sahil boyunca yürüyen kadın, kamera yavaşça yaklaşıyor, sinematik renk paleti, film greni..."
                  className="bg-[#1E1E1E] border-[#2A2A2A] text-white placeholder:text-gray-600 min-h-[140px] resize-none focus:border-purple-500/50"
                />
                <p className="text-xs text-gray-600 mt-2">{prompt.length}/1000 karakter</p>
              </Card>

              {/* Camera Motion */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-400" />
                  Kamera Hareketi
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CAMERA_MOTIONS.map((motion) => (
                    <button
                      key={motion.value}
                      onClick={() => setCameraMotion(motion.value)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center',
                        cameraMotion === motion.value
                          ? 'border-purple-500/60 bg-purple-500/10 text-white'
                          : 'border-[#2A2A2A] bg-[#1E1E1E] text-gray-400 hover:border-[#3A3A3A] hover:text-gray-300'
                      )}
                    >
                      <span className="text-lg">{motion.icon}</span>
                      <span className="text-[11px] leading-tight">{motion.label}</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Style Selector */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-400" />
                  Video Stili
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStyle(s.value)}
                      className={cn(
                        'p-3 rounded-xl border transition-all text-left',
                        style === s.value
                          ? 'border-purple-500/60 bg-purple-500/10'
                          : 'border-[#2A2A2A] bg-[#1E1E1E] hover:border-[#3A3A3A]'
                      )}
                    >
                      <p className={cn('text-sm font-medium', style === s.value ? 'text-white' : 'text-gray-300')}>
                        {s.label}
                      </p>
                      <p className="text-[10px] text-gray-600 mt-0.5">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Aspect Ratio + Duration Row */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                  <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-purple-400" />
                    En Boy Oranı
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ASPECT_RATIOS.map((ar) => (
                      <button
                        key={ar.value}
                        onClick={() => setAspectRatio(ar.value)}
                        className={cn(
                          'p-2.5 rounded-lg border transition-all text-center',
                          aspectRatio === ar.value
                            ? 'border-purple-500/60 bg-purple-500/10 text-white'
                            : 'border-[#2A2A2A] bg-[#1E1E1E] text-gray-400 hover:border-[#3A3A3A]'
                        )}
                      >
                        <p className="text-sm font-medium">{ar.label}</p>
                        <p className="text-[10px] text-gray-600">{ar.desc}</p>
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                  <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    Süre
                  </label>
                  <Select value={duration} onValueChange={(v) => setDuration(v ?? '5')}>
                    <SelectTrigger className="bg-[#1E1E1E] border-[#2A2A2A] text-white focus:border-purple-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E1E1E] border-[#2A2A2A]">
                      {DURATIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value} className="text-white focus:bg-[#2A2A2A] focus:text-white">
                          {d.label} — {d.credits} kredi
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Card>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full h-12 bg-[#00FF88] hover:bg-[#00DD77] text-black font-semibold text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Oluşturuluyor...
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
                    <Clapperboard className="w-4 h-4 text-purple-400" />
                    Sonuç
                  </label>
                  {result && (
                    <span className="text-xs text-[#00FF88] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" />
                      Hazır
                    </span>
                  )}
                </div>
                <div
                  className={cn(
                    'rounded-xl overflow-hidden bg-gradient-to-br from-[#1E1E1E] via-[#141414] to-[#1E1E1E] flex items-center justify-center border border-[#2A2A2A]',
                    aspectRatio === '16:9' && 'aspect-video',
                    aspectRatio === '9:16' && 'aspect-[9/16] max-h-[500px]',
                    aspectRatio === '1:1' && 'aspect-square max-h-[500px]',
                    aspectRatio === '4:3' && 'aspect-[4/3]'
                  )}
                >
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-purple-500/20" />
                        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-300">Video oluşturuluyor</p>
                        <p className="text-xs text-gray-600 mt-1">Bu işlem 1-2 dakika sürebilir</p>
                      </div>
                    </div>
                  ) : result ? (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 via-[#141414] to-[#00FF88]/10 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                          <Video className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-sm text-gray-300">Video önizleme</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {aspectRatio} — {duration}s — {style}
                        </p>
                        <div className="flex items-center gap-2 mt-4 justify-center">
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs">
                            İndir
                          </Button>
                          <Button size="sm" variant="outline" className="border-[#2A2A2A] text-gray-300 hover:text-white rounded-lg text-xs">
                            Düzenle
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <Wand2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">
                        Promptunuzu yazın ve video oluşturun
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        Metin ile hayalinizdeki videoyu yaratın
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Preview Info */}
              {result && (
                <Card className="bg-[#141414] border-[#2A2A2A] p-4">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Model</p>
                      <p className="text-sm text-white mt-1">Seedance 2.0</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Stil</p>
                      <p className="text-sm text-white mt-1">{STYLES.find((s) => s.value === style)?.label}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Oran</p>
                      <p className="text-sm text-white mt-1">{aspectRatio}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Süre</p>
                      <p className="text-sm text-white mt-1">{duration} sn</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Tips */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Prompt İpuçları
                </h3>
                <ul className="space-y-2">
                  {[
                    'Sahneyi detaylı tanımlayın: mekan, zaman, ışık, renkler',
                    'Kamera hareketini prompt içinde de belirtebilirsiniz',
                    'Duygusal atmosfer ekleyin: huzurlu, dramatik, enerjik',
                    '"Slow motion", "timelapse", "drone shot" gibi terimler kullanın',
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
