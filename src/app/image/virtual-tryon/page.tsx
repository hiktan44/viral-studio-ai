'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Sparkles,
  Zap,
  Loader2,
  Shirt,
  Image as ImageIcon,
  X,
  User,
  Layers,
} from 'lucide-react';

export default function VirtualTryOnPage() {
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [fitAdjust, setFitAdjust] = useState(70);
  const [preserveBackground, setPreserveBackground] = useState(true);
  const [autoAlign, setAutoAlign] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);

  const handleModelFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setModelImage(URL.createObjectURL(file));
  };

  const handleProductFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProductImage(URL.createObjectURL(file));
  };

  const handleGenerate = () => {
    if (!modelImage || !productImage) return;
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Sanal Deneme" />

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Panel */}
          <div className="w-full lg:w-[420px] border-r border-[#2A2A2A] overflow-y-auto p-5 space-y-5">
            {/* Model Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Model G&ouml;rseli
              </label>
              <input
                ref={modelInputRef}
                type="file"
                accept="image/*"
                onChange={handleModelFile}
                className="hidden"
              />
              {modelImage ? (
                <div className="relative rounded-xl border border-[#2A2A2A] overflow-hidden group">
                  <img
                    src={modelImage}
                    alt="Model"
                    className="w-full h-40 object-cover"
                  />
                  <button
                    onClick={() => setModelImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-blue-500/20 text-blue-300 text-[10px] border-0">
                      <User className="w-3 h-3 mr-1" />
                      Model
                    </Badge>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => modelInputRef.current?.click()}
                  className="w-full h-40 rounded-xl border-2 border-dashed border-[#2A2A2A] bg-[#141414] hover:border-purple-500/50 hover:bg-[#1E1E1E] transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Model foto&#x11F;raf&#x131;</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Ki&#x15F;inin tam boy g&ouml;r&uuml;nt&uuml;s&uuml;
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* Product Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                &Uuml;r&uuml;n G&ouml;rseli
              </label>
              <input
                ref={productInputRef}
                type="file"
                accept="image/*"
                onChange={handleProductFile}
                className="hidden"
              />
              {productImage ? (
                <div className="relative rounded-xl border border-[#2A2A2A] overflow-hidden group">
                  <img
                    src={productImage}
                    alt="&Uuml;r&uuml;n"
                    className="w-full h-40 object-cover"
                  />
                  <button
                    onClick={() => setProductImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] border-0">
                      <Shirt className="w-3 h-3 mr-1" />
                      &Uuml;r&uuml;n
                    </Badge>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => productInputRef.current?.click()}
                  className="w-full h-40 rounded-xl border-2 border-dashed border-[#2A2A2A] bg-[#141414] hover:border-purple-500/50 hover:bg-[#1E1E1E] transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center">
                    <Shirt className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">&Uuml;r&uuml;n g&ouml;rseli</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      K&#x131;yafet veya aksesuar
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* Fit Adjustment */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Oturma Ayar&#x131;
                </label>
                <span className="text-xs text-white font-mono bg-[#1E1E1E] px-2 py-0.5 rounded">
                  {fitAdjust}%
                </span>
              </div>
              <Slider
                value={[fitAdjust]}
                onValueChange={(v) => setFitAdjust(Array.isArray(v) ? v[0] : v)}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>Gev&#x15F;ek</span>
                <span>V&uuml;cuda Oturan</span>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#2A2A2A] bg-[#141414]">
                <div>
                  <p className="text-sm text-white">Arka Plan&#x131; Koru</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Orijinal arka plan&#x131; de&#x11F;i&#x15F;tirme
                  </p>
                </div>
                <Switch
                  checked={preserveBackground}
                  onCheckedChange={setPreserveBackground}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[#2A2A2A] bg-[#141414]">
                <div>
                  <p className="text-sm text-white">Otomatik Hizalama</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    &Uuml;r&uuml;n&uuml; v&uuml;cuda otomatik hizala
                  </p>
                </div>
                <Switch checked={autoAlign} onCheckedChange={setAutoAlign} />
              </div>
            </div>

            {/* Generate Button */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleGenerate}
                disabled={!modelImage || !productImage || isGenerating}
                className="w-full h-11 bg-[#00FF88] hover:bg-[#00E67A] text-black font-semibold text-sm rounded-lg gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uygulan&#x131;yor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Dene
                  </>
                )}
              </Button>
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <Zap className="w-3 h-3 text-purple-400" />
                <span>
                  Maliyet: <strong className="text-white">10 kredi</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-white">
                &Ouml;nizleme
              </h2>
              <Badge variant="outline" className="text-[10px] border-[#2A2A2A] text-gray-500">
                <Layers className="w-3 h-3 mr-1" />
                Sanal Deneme
              </Badge>
            </div>

            {isGenerating ? (
              <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] aspect-[3/4] max-w-md mx-auto flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  <span className="text-sm text-gray-500">
                    Sanal deneme olu&#x15F;turuluyor...
                  </span>
                </div>
              </div>
            ) : modelImage && productImage ? (
              <div className="max-w-md mx-auto space-y-4">
                {/* Preview Area */}
                <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
                  <div className="aspect-[3/4] relative">
                    <img
                      src={modelImage}
                      alt="Model"
                      className="w-full h-full object-cover"
                    />
                    {/* Product overlay placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-48 h-48 rounded-xl bg-gradient-to-br from-emerald-600/30 to-blue-600/30 border border-white/10 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center">
                          <Shirt className="w-8 h-8 text-white/40 mx-auto mb-1" />
                          <p className="text-[10px] text-white/50">&Uuml;r&uuml;n</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <Badge className="bg-black/60 backdrop-blur-sm text-white text-[10px] border-0">
                        Otomatik Hizalama
                      </Badge>
                      <Badge className="bg-[#00FF88]/20 text-emerald-300 text-[10px] border-0">
                        Haz&#x131;r
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Source thumbnails */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-[#2A2A2A] overflow-hidden">
                    <img
                      src={modelImage}
                      alt="Model"
                      className="w-full h-20 object-cover"
                    />
                    <div className="p-1.5 border-t border-[#2A2A2A] text-center">
                      <span className="text-[10px] text-gray-500">Model</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#2A2A2A] overflow-hidden">
                    <img
                      src={productImage}
                      alt="&Uuml;r&uuml;n"
                      className="w-full h-20 object-cover"
                    />
                    <div className="p-1.5 border-t border-[#2A2A2A] text-center">
                      <span className="text-[10px] text-gray-500">&Uuml;r&uuml;n</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#2A2A2A] bg-[#0A0A0A] aspect-[3/4] max-w-md mx-auto flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-600">
                  <Shirt className="w-10 h-10" />
                  <div className="text-center">
                    <p className="text-sm">
                      Model ve &uuml;r&uuml;n g&ouml;rsellerini y&uuml;kleyin
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      &Ouml;nizleme burada g&ouml;r&uuml;nt&uuml;lenecek
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
