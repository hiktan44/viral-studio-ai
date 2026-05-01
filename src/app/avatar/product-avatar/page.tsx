'use client';

import { useState, useCallback } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Upload,
  Sparkles,
  Loader2,
  Package,
  Image as ImageIcon,
  Check,
  Zap,
  LayoutTemplate,
} from 'lucide-react';

const TEMPLATES = Array.from({ length: 8 }, (_, i) => ({
  id: `template-${i + 1}`,
  name: [
    'Ürün Tanıtım',
    'Sosyal Medya',
    'E-ticaret',
    'Reklam Spotu',
    'Unboxing',
    'Karşılaştırma',
    'Detay İnceleme',
    'Story Format',
  ][i],
  gradient: [
    'from-purple-600 to-blue-600',
    'from-pink-500 to-rose-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-violet-600 to-purple-600',
    'from-cyan-500 to-blue-500',
    'from-amber-500 to-orange-500',
    'from-indigo-500 to-purple-500',
  ][i],
  aspect: ['16:9', '9:16', '1:1', '16:9', '9:16', '16:9', '16:10', '9:16'][i],
}));

export default function ProductAvatarPage() {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productPreview, setProductPreview] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('template-1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setProductImage(file);
      setProductPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      setProductPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleGenerate = async () => {
    if (!productImage) return;
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 3000));
    setResult('generated');
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Ürün Avatarı" subtitle="Ürün görselinizi otomatik tanıtan videolara dönüştürün" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input */}
            <div className="space-y-6">
              {/* Product Upload */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-400" />
                  Ürün Görseli
                </label>
                <div
                  onDrop={handleImageDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className={cn(
                    'relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer group',
                    productPreview
                      ? 'border-purple-500/40 bg-purple-500/5'
                      : 'border-[#2A2A2A] hover:border-purple-500/50 hover:bg-[#1E1E1E]'
                  )}
                >
                  {productPreview ? (
                    <div className="relative p-4">
                      <img src={productPreview} alt="Product" className="w-full h-56 object-contain rounded-lg bg-white/5" />
                      <button
                        onClick={() => {
                          setProductImage(null);
                          setProductPreview(null);
                        }}
                        className="absolute top-6 right-6 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors text-xs"
                      >
                        Kaldır
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-56 cursor-pointer">
                      <div className="w-14 h-14 rounded-2xl bg-[#1E1E1E] flex items-center justify-center mb-3 group-hover:bg-purple-500/10 transition-colors">
                        <Package className="w-6 h-6 text-gray-500 group-hover:text-purple-400 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-400 mb-1">Ürün görseli sürükleyin</p>
                      <p className="text-xs text-gray-600">PNG, JPG, WebP — Arka plan kaldırılır</p>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    </label>
                  )}
                </div>
              </Card>

              {/* Template Selector */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4 text-purple-400" />
                  Şablon Seçin
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={cn(
                        'relative rounded-xl overflow-hidden transition-all',
                        selectedTemplate === tpl.id
                          ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-[#141414]'
                          : 'hover:ring-2 hover:ring-purple-500/30 hover:ring-offset-2 hover:ring-offset-[#141414]'
                      )}
                    >
                      <div className={cn(
                        'aspect-[3/4] bg-gradient-to-br flex items-center justify-center',
                        tpl.gradient
                      )}>
                        <Package className="w-6 h-6 text-white/60" />
                      </div>
                      {selectedTemplate === tpl.id && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1.5 px-2">
                        <p className="text-[10px] text-white text-center truncate">{tpl.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Generate */}
              <Button
                onClick={handleGenerate}
                disabled={!productImage || isGenerating}
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
                    Ürün Videosu Oluştur
                    <span className="ml-3 px-2 py-0.5 bg-black/20 rounded-full text-xs">8 kredi</span>
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
                <div className="aspect-[3/4] max-h-[500px] rounded-xl overflow-hidden bg-gradient-to-br from-[#1E1E1E] via-[#141414] to-[#1E1E1E] flex items-center justify-center border border-[#2A2A2A]">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-purple-500/20" />
                        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-300">Ürün videosu oluşturuluyor</p>
                        <p className="text-xs text-gray-600 mt-1">Arka plan kaldırılıyor...</p>
                      </div>
                    </div>
                  ) : result ? (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 via-[#141414] to-[#00FF88]/10 flex items-center justify-center">
                      <div className="text-center p-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-3 flex items-center justify-center">
                          <Package className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-sm text-gray-300">Ürün video önizleme</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {TEMPLATES.find((t) => t.id === selectedTemplate)?.name} şablonu
                        </p>
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
                      <Package className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Ürün görseli yükleyin</p>
                      <p className="text-xs text-gray-700 mt-1">ve şablon seçin</p>
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
                    'Ürününüzün net ve yüksek çözünürlüklü bir fotoğrafını yükleyin',
                    'Arka plan otomatik olarak kaldırılır',
                    'Şablonlar farklı sosyal medya formatlarına uygun tasarlanmıştır',
                    'E-ticaret şablonu fiyat ve özellik bilgisi ekler',
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
