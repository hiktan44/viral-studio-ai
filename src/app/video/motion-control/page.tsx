'use client';

import { useState, useCallback } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  Upload,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  PenTool,
  Zap,
} from 'lucide-react';

const MOTION_VECTORS = [
  { id: 'up', label: 'Yukarı', icon: ArrowUp, dx: 0, dy: -1 },
  { id: 'down', label: 'Aşağı', icon: ArrowDown, dx: 0, dy: 1 },
  { id: 'left', label: 'Sol', icon: ArrowLeft, dx: -1, dy: 0 },
  { id: 'right', label: 'Sağ', icon: ArrowRight, dx: 1, dy: 0 },
  { id: 'zoom-in', label: 'Yakınlaştır', icon: ZoomIn, dx: 0, dy: 0 },
  { id: 'zoom-out', label: 'Uzaklaştır', icon: ZoomOut, dx: 0, dy: 0 },
  { id: 'rotate', label: 'Döndür', icon: RotateCw, dx: 0, dy: 0 },
];

export default function MotionControlPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedMotions, setSelectedMotions] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [regionalMask, setRegionalMask] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

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

  const toggleMotion = (id: string) => {
    setSelectedMotions((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!imageFile || selectedMotions.length === 0) return;
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 3000));
    setResult('generated');
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Hareket Kontrolü" subtitle="Görselinizdeki hareket yönlerini hassas şekilde belirleyin" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input */}
            <div className="space-y-6">
              {/* Image Upload */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
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
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
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
                      <p className="text-sm text-gray-400 mb-1">Görsel sürükleyin veya tıklayın</p>
                      <p className="text-xs text-gray-600">PNG, JPG, WebP — Max 10MB</p>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    </label>
                  )}
                </div>
              </Card>

              {/* Motion Vector Area */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                  <Move className="w-4 h-4 text-purple-400" />
                  Hareket Vektörleri
                </label>

                {/* Visual motion area */}
                <div className="relative aspect-square max-h-[260px] rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center mb-4 overflow-hidden">
                  {/* Grid lines */}
                  <div className="absolute inset-0 opacity-10">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={`h-${i}`}
                        className="absolute w-full border-t border-gray-500"
                        style={{ top: `${(i + 1) * 20}%` }}
                      />
                    ))}
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={`v-${i}`}
                        className="absolute h-full border-l border-gray-500"
                        style={{ left: `${(i + 1) * 20}%` }}
                      />
                    ))}
                  </div>

                  {/* Center object placeholder */}
                  <div className="relative w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                    <PenTool className="w-6 h-6 text-purple-400" />
                  </div>

                  {/* Direction arrows around center */}
                  {selectedMotions.includes('up') && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <ArrowUp className="w-5 h-5 text-[#00FF88]" />
                      <div className="w-0.5 h-8 bg-gradient-to-b from-[#00FF88] to-transparent" />
                    </div>
                  )}
                  {selectedMotions.includes('down') && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div className="w-0.5 h-8 bg-gradient-to-t from-[#00FF88] to-transparent" />
                      <ArrowDown className="w-5 h-5 text-[#00FF88]" />
                    </div>
                  )}
                  {selectedMotions.includes('left') && (
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center">
                      <ArrowLeft className="w-5 h-5 text-[#00FF88]" />
                      <div className="h-0.5 w-8 bg-gradient-to-r from-[#00FF88] to-transparent" />
                    </div>
                  )}
                  {selectedMotions.includes('right') && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center">
                      <div className="h-0.5 w-8 bg-gradient-to-l from-[#00FF88] to-transparent" />
                      <ArrowRight className="w-5 h-5 text-[#00FF88]" />
                    </div>
                  )}
                  {selectedMotions.includes('zoom-in') && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-28 h-28 rounded-full border-2 border-dashed border-[#00FF88]/50 animate-pulse" />
                    </div>
                  )}
                  {selectedMotions.includes('zoom-out') && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#00FF88]/50 animate-pulse" />
                    </div>
                  )}
                  {selectedMotions.includes('rotate') && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <RotateCw className="w-8 h-8 text-[#00FF88] animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                  )}
                </div>

                {/* Motion buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {MOTION_VECTORS.map((motion) => {
                    const Icon = motion.icon;
                    const isActive = selectedMotions.includes(motion.id);
                    return (
                      <button
                        key={motion.id}
                        onClick={() => toggleMotion(motion.id)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all',
                          isActive
                            ? 'border-[#00FF88]/50 bg-[#00FF88]/10 text-[#00FF88]'
                            : 'border-[#2A2A2A] bg-[#1E1E1E] text-gray-400 hover:border-[#3A3A3A] hover:text-gray-300'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px]">{motion.label}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Regional Mask Toggle */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1E1E1E] flex items-center justify-center">
                      <PenTool className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-300">Bölgesel Maske</p>
                      <p className="text-xs text-gray-600">Hareketi sadece belirli bir alana uygula</p>
                    </div>
                  </div>
                  <Switch
                    checked={regionalMask}
                    onCheckedChange={setRegionalMask}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>
                {regionalMask && (
                  <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <p className="text-xs text-purple-300">
                      Bölge maskeleme aktif. Sonuç görüntüsünde hareket uygulanacak alanı fırça ile seçebilirsiniz.
                    </p>
                  </div>
                )}
              </Card>

              {/* Optional Prompt */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block">
                  Ek Prompt (Opsiyonel)
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Hareketi daha detaylı tanımlayın, örn: yavaş ve pürüzsüz kamera hareketi..."
                  className="bg-[#1E1E1E] border-[#2A2A2A] text-white placeholder:text-gray-600 min-h-[80px] resize-none focus:border-purple-500/50"
                />
              </Card>

              {/* Generate */}
              <Button
                onClick={handleGenerate}
                disabled={!imageFile || selectedMotions.length === 0 || isGenerating}
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
                    Hareket Uygula
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
                    <Move className="w-4 h-4 text-purple-400" />
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
                        <p className="text-sm text-gray-300">Hareket uygulanıyor</p>
                        <p className="text-xs text-gray-600 mt-1">Vektörler hesaplanıyor...</p>
                      </div>
                    </div>
                  ) : result ? (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 via-[#141414] to-[#00FF88]/10 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                          <Move className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-sm text-gray-300">Video önizleme</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedMotions.length} hareket vektörü uygulandı
                        </p>
                        <div className="flex items-center gap-2 mt-4 justify-center">
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs">
                            İndir
                          </Button>
                          <Button size="sm" variant="outline" className="border-[#2A2A2A] text-gray-300 hover:text-white rounded-lg text-xs">
                            Ayarla
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <Move className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Görsel yükleyin ve hareket vektörleri seçin</p>
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
                    'Birden fazla hareket vektörü kombinleyebilirsiniz',
                    'Bölgesel maske ile hareketi belirli nesnelere sınırlandırın',
                    'Yumuşak geçişler için düşük yoğunlukta hareket seçin',
                    'Karmaşık sahnelerde tek bir hareket daha iyi sonuç verir',
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
