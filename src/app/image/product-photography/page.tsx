'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Sparkles,
  Zap,
  Loader2,
  Camera,
  Image as ImageIcon,
  X,
  Mountain,
  Building2,
  TreePine,
  Sun,
  Waves,
  Grid3X3,
} from 'lucide-react';

const SCENES = [
  {
    id: 'studio',
    label: 'St&uuml;dyo',
    desc: 'Profesyonel ayd&#x131;nlatma',
    gradient: 'from-gray-600/40 to-slate-600/40',
    icon: Sun,
  },
  {
    id: 'nature',
    label: 'Do&#x11F;a',
    desc: 'Ye&#x15F;il alanlar',
    gradient: 'from-green-600/40 to-emerald-600/40',
    icon: TreePine,
  },
  {
    id: 'city',
    label: '&#x15E;ehir',
    desc: 'Modern kent',
    gradient: 'from-amber-600/40 to-orange-600/40',
    icon: Building2,
  },
  {
    id: 'beach',
    label: 'Sahil',
    desc: 'Kumsal ve deniz',
    gradient: 'from-cyan-600/40 to-blue-600/40',
    icon: Waves,
  },
  {
    id: 'mountain',
    label: 'Da&#x11F;',
    desc: 'Da&#x11F; manzaras&#x131;',
    gradient: 'from-slate-600/40 to-indigo-600/40',
    icon: Mountain,
  },
  {
    id: 'minimal',
    label: 'Minimal',
    desc: 'Temiz arka plan',
    gradient: 'from-zinc-600/40 to-neutral-600/40',
    icon: Grid3X3,
  },
];

export default function ProductPhotographyPage() {
  const [productImage, setProductImage] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState('studio');
  const [customPrompt, setCustomPrompt] = useState('');
  const [multiAngle, setMultiAngle] = useState(false);
  const [angleCount, setAngleCount] = useState(3);
  const [removeBg, setRemoveBg] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProductImage(URL.createObjectURL(file));
  };

  const handleGenerate = () => {
    if (!productImage) return;
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  const sceneColors = [
    'from-purple-600/30 to-blue-600/30',
    'from-emerald-600/30 to-cyan-600/30',
    'from-rose-600/30 to-orange-600/30',
    'from-indigo-600/30 to-violet-600/30',
    'from-amber-600/30 to-yellow-600/30',
    'from-teal-600/30 to-green-600/30',
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="&Uuml;r&uuml;n Foto&#x11F;raf&ccedil;&#x131;l&#x131;&#x11F;&#x131;" />

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Panel */}
          <div className="w-full lg:w-[420px] border-r border-[#2A2A2A] overflow-y-auto p-5 space-y-5">
            {/* Product Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                &Uuml;r&uuml;n G&ouml;rseli
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {productImage ? (
                <div className="relative rounded-xl border border-[#2A2A2A] overflow-hidden group">
                  <img
                    src={productImage}
                    alt="&Uuml;r&uuml;n"
                    className="w-full h-48 object-cover bg-white"
                  />
                  <button
                    onClick={() => setProductImage(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 rounded-xl border-2 border-dashed border-[#2A2A2A] bg-[#141414] hover:border-purple-500/50 hover:bg-[#1E1E1E] transition-all flex flex-col items-center justify-center gap-3 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center">
                    <Camera className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">
                      &Uuml;r&uuml;n foto&#x11F;raf&#x131; y&uuml;kle
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Beyaz arka plan &ouml;nerilir
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* Scene Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Sahne / Arka Plan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SCENES.map((scene) => {
                  const SceneIcon = scene.icon;
                  return (
                    <button
                      key={scene.id}
                      onClick={() => setSelectedScene(scene.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all',
                        selectedScene === scene.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-[#2A2A2A] bg-[#141414] hover:border-[#3A3A3A]'
                      )}
                    >
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center',
                          scene.gradient
                        )}
                      >
                        <SceneIcon className="w-4 h-4 text-white/60" />
                      </div>
                      <div className="text-center">
                        <span
                          className={cn(
                            'text-xs block',
                            selectedScene === scene.id
                              ? 'text-white'
                              : 'text-gray-400'
                          )}
                          dangerouslySetInnerHTML={{ __html: scene.label }}
                        />
                        <span className="text-[10px] text-gray-600" dangerouslySetInnerHTML={{ __html: scene.desc }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Scene Prompt */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                &Ozel Sahne (Opsiyonel)
              </label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Arka plan a&ccedil;&#x131;klaman&#x131;z&#x131; yaz&#x131;n..."
                className="min-h-[70px] bg-[#141414] border-[#2A2A2A] text-white placeholder:text-gray-600 resize-none"
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#2A2A2A] bg-[#141414]">
                <div>
                  <p className="text-sm text-white">Arka Plan Kald&#x131;r</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Orijinal arka plan&#x131; otomatik kald&#x131;r
                  </p>
                </div>
                <Switch checked={removeBg} onCheckedChange={setRemoveBg} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[#2A2A2A] bg-[#141414]">
                <div>
                  <p className="text-sm text-white">Multi-A&ccedil;&#x131;</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Farkl&#x131; a&ccedil;&#x131;lardan &ccedil;ekim sim&uuml;lasyonu
                  </p>
                </div>
                <Switch checked={multiAngle} onCheckedChange={setMultiAngle} />
              </div>
            </div>

            {/* Angle Count (when multi-angle enabled) */}
            {multiAngle && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  A&ccedil;&#x131; Say&#x131;s&#x131;
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4, 6].map((n) => (
                    <button
                      key={n}
                      onClick={() => setAngleCount(n)}
                      className={cn(
                        'flex-1 py-2 rounded-lg border text-sm font-medium transition-all',
                        angleCount === n
                          ? 'border-purple-500 bg-purple-500/10 text-white'
                          : 'border-[#2A2A2A] bg-[#141414] text-gray-400 hover:border-[#3A3A3A]'
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Generate Button */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleGenerate}
                disabled={!productImage || isGenerating}
                className="w-full h-11 bg-[#00FF88] hover:bg-[#00E67A] text-black font-semibold text-sm rounded-lg gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Olu&#x15F;turuluyor...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Foto&#x11F;raf Olu&#x15F;tur
                  </>
                )}
              </Button>
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <Zap className="w-3 h-3 text-purple-400" />
                <span>
                  Maliyet:{' '}
                  <strong className="text-white">
                    {multiAngle ? angleCount * 3 : 5} kredi
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-white">Sonu&ccedil;lar</h2>
              <Badge variant="outline" className="text-[10px] border-[#2A2A2A] text-gray-500">
                <Grid3X3 className="w-3 h-3 mr-1" />
                {multiAngle ? `${angleCount} G&ouml;r&uuml;nt&uuml;` : 'Galeri'}
              </Badge>
            </div>

            {isGenerating ? (
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: multiAngle ? angleCount : 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-xl border border-[#2A2A2A] bg-[#141414] aspect-square flex items-center justify-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                      <span className="text-xs text-gray-500">
                        {i + 1}/{multiAngle ? angleCount : 4}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : productImage ? (
              <div className="space-y-4">
                {/* Main result grid */}
                <div
                  className={cn(
                    'grid gap-4',
                    multiAngle && angleCount > 2
                      ? 'grid-cols-2'
                      : 'grid-cols-2'
                  )}
                >
                  {Array.from({ length: multiAngle ? angleCount : 4 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="rounded-xl border border-[#2A2A2A] overflow-hidden group cursor-pointer hover:border-purple-500/40 transition-all"
                    >
                      <div
                        className={cn(
                          'aspect-square bg-gradient-to-br flex items-center justify-center relative',
                          sceneColors[i % sceneColors.length]
                        )}
                      >
                        {/* Product overlay */}
                        <img
                          src={productImage}
                          alt={`Sonu&ccedil; ${i + 1}`}
                          className="w-1/2 h-1/2 object-contain relative z-10 drop-shadow-lg"
                        />
                        {/* Hover actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                          <Button size="sm" variant="secondary" className="text-xs bg-[#1E1E1E]/80 backdrop-blur-sm">
                            B&uuml;y&uuml;t
                          </Button>
                          <Button size="sm" variant="secondary" className="text-xs bg-[#1E1E1E]/80 backdrop-blur-sm">
                            &#x130;ndir
                          </Button>
                        </div>
                        {/* Angle label */}
                        {multiAngle && (
                          <div className="absolute bottom-2 left-2 z-20">
                            <Badge className="bg-black/60 backdrop-blur-sm text-white text-[10px] border-0">
                              A&ccedil;&#x131; {i + 1}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Scene info */}
                <div className="flex items-center gap-2 p-3 rounded-lg border border-[#2A2A2A] bg-[#141414]">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center',
                      SCENES.find((s) => s.id === selectedScene)?.gradient
                    )}
                  >
                    {React.createElement(
                      SCENES.find((s) => s.id === selectedScene)?.icon || Sun,
                      { className: 'w-4 h-4 text-white/60' }
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-white"
                      dangerouslySetInnerHTML={{
                        __html: SCENES.find((s) => s.id === selectedScene)?.label ?? '',
                      }}
                    />
                    <p className="text-[10px] text-gray-500"
                      dangerouslySetInnerHTML={{
                        __html: SCENES.find((s) => s.id === selectedScene)?.desc ?? '',
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#2A2A2A] bg-[#0A0A0A] aspect-video flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-600">
                  <Camera className="w-10 h-10" />
                  <div className="text-center">
                    <p className="text-sm">
                      &Uuml;r&uuml;n foto&#x11F;raf&#x131; y&uuml;kleyin
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      Bir sahne se&ccedil;in ve profesyonel &ccedil;ekimler
                      olu&#x15F;turun
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
