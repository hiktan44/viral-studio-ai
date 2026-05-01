'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Sparkles,
  Zap,
  Loader2,
  ScanFace,
  Image as ImageIcon,
  X,
  Users,
} from 'lucide-react';

export default function FaceSwapPage() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [targetImage, setTargetImage] = useState<string | null>(null);
  const [multiFace, setMultiFace] = useState(false);
  const [faceIndex, setFaceIndex] = useState(1);
  const [blendStrength, setBlendStrength] = useState(80);
  const [enhanceResult, setEnhanceResult] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);

  const handleSourceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSourceImage(URL.createObjectURL(file));
  };

  const handleTargetFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setTargetImage(URL.createObjectURL(file));
  };

  const handleGenerate = () => {
    if (!sourceImage || !targetImage) return;
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Y&uuml;z De&#x11F;i&#x15F;imi" />

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Panel */}
          <div className="w-full lg:w-[420px] border-r border-[#2A2A2A] overflow-y-auto p-5 space-y-5">
            {/* Source Face Upload */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Kaynak Y&uuml;z
              </label>
              <input
                ref={sourceInputRef}
                type="file"
                accept="image/*"
                onChange={handleSourceFile}
                className="hidden"
              />
              {sourceImage ? (
                <div className="relative rounded-xl border border-[#2A2A2A] overflow-hidden group">
                  <img
                    src={sourceImage}
                    alt="Kaynak y&uuml;z"
                    className="w-full h-36 object-cover"
                  />
                  <button
                    onClick={() => setSourceImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => sourceInputRef.current?.click()}
                  className="w-full h-36 rounded-xl border-2 border-dashed border-[#2A2A2A] bg-[#141414] hover:border-purple-500/50 hover:bg-[#1E1E1E] transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center">
                    <ScanFace className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Kaynak y&uuml;z y&uuml;kle</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Y&uuml;z&uuml;n net g&ouml;r&uuml;nd&#x11F;&#x11F;&#x121; foto&#x11F;raf
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* Target Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Hedef G&ouml;rsel
              </label>
              <input
                ref={targetInputRef}
                type="file"
                accept="image/*"
                onChange={handleTargetFile}
                className="hidden"
              />
              {targetImage ? (
                <div className="relative rounded-xl border border-[#2A2A2A] overflow-hidden group">
                  <img
                    src={targetImage}
                    alt="Hedef g&ouml;rsel"
                    className="w-full h-36 object-cover"
                  />
                  <button
                    onClick={() => setTargetImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => targetInputRef.current?.click()}
                  className="w-full h-36 rounded-xl border-2 border-dashed border-[#2A2A2A] bg-[#141414] hover:border-purple-500/50 hover:bg-[#1E1E1E] transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Hedef g&ouml;rsel y&uuml;kle</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Y&uuml;z de&#x11F;i&#x15F;tirilecek g&ouml;rsel
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* Multi-Face Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-[#2A2A2A] bg-[#141414]">
              <div>
                <p className="text-sm text-white">Toplu Y&uuml;z Deste&#x11F;i</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  G&ouml;rseldeki t&uuml;m y&uuml;zleri de&#x11F;i&#x15F;tir
                </p>
              </div>
              <Switch checked={multiFace} onCheckedChange={setMultiFace} />
            </div>

            {/* Multi-face options */}
            {multiFace && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Hedef Y&uuml;z Endeksi
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((n) => (
                      <button
                        key={n}
                        onClick={() => setFaceIndex(n)}
                        className={cn(
                          'flex-1 py-2 rounded-lg border text-sm font-medium transition-all',
                          faceIndex === n
                            ? 'border-purple-500 bg-purple-500/10 text-white'
                            : 'border-[#2A2A2A] bg-[#141414] text-gray-400 hover:border-[#3A3A3A]'
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Blend Strength */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Kar&#x131;&#x15F;&#x131;m G&uuml;c&uuml;
                </label>
                <span className="text-xs text-white font-mono bg-[#1E1E1E] px-2 py-0.5 rounded">
                  {blendStrength}%
                </span>
              </div>
              <Slider
                value={[blendStrength]}
                onValueChange={(v) => setBlendStrength(Array.isArray(v) ? v[0] : v)}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Enhance Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-[#2A2A2A] bg-[#141414]">
              <div>
                <p className="text-sm text-white">Y&uuml;z Y&uuml;kseltme</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Sonu&ccedil; y&uuml;z&uuml;n&uuml; AI ile iyile&#x15F;tir
                </p>
              </div>
              <Switch checked={enhanceResult} onCheckedChange={setEnhanceResult} />
            </div>

            {/* Generate Button */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleGenerate}
                disabled={!sourceImage || !targetImage || isGenerating}
                className="w-full h-11 bg-[#00FF88] hover:bg-[#00E67A] text-black font-semibold text-sm rounded-lg gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    De&#x11F;i&#x15F;tiriliyor...
                  </>
                ) : (
                  <>
                    <ScanFace className="w-4 h-4" />
                    Y&uuml;z De&#x11F;i&#x15F;tir
                  </>
                )}
              </Button>
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <Zap className="w-3 h-3 text-purple-400" />
                <span>
                  Maliyet: <strong className="text-white">{multiFace ? '10' : '6'} kredi</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-white">Sonu&ccedil;</h2>
              <Badge variant="outline" className="text-[10px] border-[#2A2A2A] text-gray-500">
                <ScanFace className="w-3 h-3 mr-1" />
                Y&uuml;z
              </Badge>
            </div>

            {isGenerating ? (
              <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] aspect-video flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  <span className="text-sm text-gray-500">
                    Y&uuml;z de&#x11F;i&#x15F;imi uygulan&#x131;yor...
                  </span>
                </div>
              </div>
            ) : sourceImage && targetImage ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {/* Source */}
                  <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
                    <img
                      src={sourceImage}
                      alt="Kaynak"
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-2 border-t border-[#2A2A2A]">
                      <Badge className="bg-blue-500/20 text-blue-300 text-[10px] border-0 w-full justify-center">
                        Kaynak Y&uuml;z
                      </Badge>
                    </div>
                  </div>

                  {/* Target */}
                  <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
                    <img
                      src={targetImage}
                      alt="Hedef"
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-2 border-t border-[#2A2A2A]">
                      <Badge className="bg-amber-500/20 text-amber-300 text-[10px] border-0 w-full justify-center">
                        Hedef G&ouml;rsel
                      </Badge>
                    </div>
                  </div>

                  {/* Result Placeholder */}
                  <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
                    <div className="w-full aspect-square bg-gradient-to-br from-purple-600/40 to-emerald-600/40 flex items-center justify-center">
                      <ScanFace className="w-8 h-8 text-white/40" />
                    </div>
                    <div className="p-2 border-t border-[#2A2A2A]">
                      <Badge className="bg-[#00FF88]/20 text-emerald-300 text-[10px] border-0 w-full justify-center">
                        Sonu&ccedil;
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#2A2A2A] bg-[#0A0A0A] aspect-video flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-600">
                  <ScanFace className="w-10 h-10" />
                  <div className="text-center">
                    <p className="text-sm">
                      Y&uuml;z de&#x11F;i&#x15F;imi i&ccedil;in iki g&ouml;rsel y&uuml;kleyin
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      Kaynak y&uuml;z ve hedef g&ouml;rsel gerekli
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
