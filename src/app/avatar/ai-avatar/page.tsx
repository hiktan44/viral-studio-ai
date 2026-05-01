'use client';

import { useState, useCallback } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTaskPolling } from '@/lib/kie/useTaskPolling';
import {
  Sparkles,
  Loader2,
  User,
  Mic,
  Image as ImageIcon,
  Monitor,
  Globe,
  Palette,
  Zap,
  Check,
  Upload,
} from 'lucide-react';

const AVATARS = Array.from({ length: 12 }, (_, i) => ({
  id: `avatar-${i + 1}`,
  gradient: [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-violet-500 to-purple-500',
    'from-teal-500 to-green-500',
    'from-rose-500 to-pink-500',
    'from-indigo-500 to-blue-500',
    'from-amber-500 to-orange-500',
    'from-fuchsia-500 to-pink-500',
    'from-sky-500 to-blue-500',
    'from-lime-500 to-green-500',
  ][i],
  name: [
    'Elif', 'Deniz', 'Zeynep', 'Ali', 'Ayşe', 'Mehmet',
    'Selin', 'Burak', 'Ceren', 'Emre', 'Derya', 'Can',
  ][i],
}));

const VOICES = [
  { value: 'female-tr', label: 'Kadın - Türkçe', gender: 'female' },
  { value: 'male-tr', label: 'Erkek - Türkçe', gender: 'male' },
  { value: 'female-en', label: 'Kadın - İngilizce', gender: 'female' },
  { value: 'male-en', label: 'Erkek - İngilizce', gender: 'male' },
  { value: 'female-fr', label: 'Kadın - Fransızca', gender: 'female' },
  { value: 'male-de', label: 'Erkek - Almanca', gender: 'male' },
];

const BACKGROUNDS = [
  { value: 'white', label: 'Beyaz', type: 'color', preview: 'bg-white' },
  { value: 'gray', label: 'Gri', type: 'color', preview: 'bg-gray-500' },
  { value: 'blue', label: 'Mavi', type: 'color', preview: 'bg-blue-500' },
  { value: 'gradient-1', label: 'Mor Gradient', type: 'gradient', preview: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  { value: 'gradient-2', label: 'Mavi Gradient', type: 'gradient', preview: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
  { value: 'office', label: 'Ofis', type: 'image', preview: 'bg-gradient-to-br from-gray-600 to-gray-800' },
  { value: 'studio', label: 'Stüdyo', type: 'image', preview: 'bg-gradient-to-br from-gray-700 to-gray-900' },
  { value: 'custom', label: 'Özel Yükle', type: 'upload', preview: '' },
];

const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9', desc: 'Yatay' },
  { value: '9:16', label: '9:16', desc: 'Dikey' },
  { value: '1:1', label: '1:1', desc: 'Kare' },
];

const LANGUAGES = [
  { value: 'tr', label: 'Türkçe' },
  { value: 'en', label: 'İngilizce' },
  { value: 'fr', label: 'Fransızca' },
  { value: 'de', label: 'Almanca' },
  { value: 'es', label: 'İspanyolca' },
  { value: 'ja', label: 'Japonca' },
];

export default function AiAvatarPage() {
  const [selectedAvatar, setSelectedAvatar] = useState('avatar-1');
  const [script, setScript] = useState('');
  const [voice, setVoice] = useState('female-tr');
  const [background, setBackground] = useState('gradient-1');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [language, setLanguage] = useState('tr');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { result, start, reset } = useTaskPolling();

  const isGenerating = result.state === 'waiting' || result.state === 'queuing' || result.state === 'generating';

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      reset();
    }
  }, [reset]);

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      reset();
    }
  }, [reset]);

  const handleGenerate = async () => {
    if (!script.trim() || !imageFile) return;

    // 1. Upload image
    const formData = new FormData();
    formData.append('file', imageFile);
    const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
    const uploadData = await uploadRes.json();
    if (!uploadData.url) return;

    // 2. Start avatar generation
    start({
      endpoint: '/api/generate/avatar',
      body: {
        type: 'avatar',
        prompt: script,
        image_url: uploadData.url,
      },
      taskType: 'market',
    });
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="AI Avatar" subtitle="Yapay zeka destekli avatar videoları oluşturun" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input */}
            <div className="space-y-6">
              {/* Avatar Gallery */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" />
                  Avatar Seçin
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={cn(
                        'relative aspect-square rounded-xl overflow-hidden transition-all group',
                        selectedAvatar === avatar.id
                          ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-[#141414]'
                          : 'hover:ring-2 hover:ring-purple-500/30 hover:ring-offset-2 hover:ring-offset-[#141414]'
                      )}
                    >
                      <div className={cn('w-full h-full bg-gradient-to-br', avatar.gradient)} />
                      {selectedAvatar === avatar.id && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <span className="absolute bottom-0 inset-x-0 text-[9px] text-center text-white bg-black/50 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {avatar.name}
                      </span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Image Upload */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  Avatar Fotoğrafı
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
                    <div className="relative p-3">
                      <img src={imagePreview} alt="Avatar" className="w-full h-32 object-cover rounded-lg" />
                      <button
                        onClick={() => { setImageFile(null); setImagePreview(null); reset(); }}
                        className="absolute top-5 right-5 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors text-xs"
                      >
                        Kaldır
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-28 cursor-pointer">
                      <Upload className="w-6 h-6 text-gray-500 group-hover:text-purple-400 mb-2 transition-colors" />
                      <p className="text-sm text-gray-400 mb-0.5">Fotoğraf sürükleyin</p>
                      <p className="text-xs text-gray-600">PNG, JPG, WebP</p>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    </label>
                  )}
                </div>
              </Card>

              {/* Script */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                  <Mic className="w-4 h-4 text-purple-400" />
                  Metin / Senaryo
                </label>
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Merhaba, bugün sizlere yeni ürünümüzü tanıtmak istiyorum. Bu inovatif çözüm ile..."
                  className="bg-[#1E1E1E] border-[#2A2A2A] text-white placeholder:text-gray-600 min-h-[120px] resize-none focus:border-purple-500/50"
                />
                <p className="text-xs text-gray-600 mt-2">{script.length}/2000 karakter</p>
              </Card>

              {/* Voice Selector */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                  <Mic className="w-4 h-4 text-purple-400" />
                  Ses
                </label>
                <Select value={voice} onValueChange={(v) => setVoice(v ?? 'female-tr')}>
                  <SelectTrigger className="bg-[#1E1E1E] border-[#2A2A2A] text-white focus:border-purple-500/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E1E1E] border-[#2A2A2A]">
                    {VOICES.map((v) => (
                      <SelectItem key={v.value} value={v.value} className="text-white focus:bg-[#2A2A2A] focus:text-white">
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Card>

              {/* Background Selector */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-400" />
                  Arka Plan
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.value}
                      onClick={() => setBackground(bg.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
                        background === bg.value
                          ? 'border-purple-500/60 bg-purple-500/10'
                          : 'border-[#2A2A2A] bg-[#1E1E1E] hover:border-[#3A3A3A]'
                      )}
                    >
                      {bg.value === 'custom' ? (
                        <div className="w-8 h-8 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">+</span>
                        </div>
                      ) : (
                        <div className={cn('w-8 h-8 rounded-lg', bg.preview)} />
                      )}
                      <span className="text-[10px] text-gray-400">{bg.label}</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Aspect Ratio + Language */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                  <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-purple-400" />
                    Oran
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ASPECT_RATIOS.map((ar) => (
                      <button
                        key={ar.value}
                        onClick={() => setAspectRatio(ar.value)}
                        className={cn(
                          'p-2 rounded-lg border transition-all text-center',
                          aspectRatio === ar.value
                            ? 'border-purple-500/60 bg-purple-500/10 text-white'
                            : 'border-[#2A2A2A] bg-[#1E1E1E] text-gray-400 hover:border-[#3A3A3A]'
                        )}
                      >
                        <p className="text-xs font-medium">{ar.label}</p>
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                  <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-400" />
                    Dil
                  </label>
                  <Select value={language} onValueChange={(v) => setLanguage(v ?? 'tr')}>
                    <SelectTrigger className="bg-[#1E1E1E] border-[#2A2A2A] text-white focus:border-purple-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E1E1E] border-[#2A2A2A]">
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l.value} value={l.value} className="text-white focus:bg-[#2A2A2A] focus:text-white">
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Card>
              </div>

              {/* Generate */}
              <Button
                onClick={handleGenerate}
                disabled={!script.trim() || !imageFile || isGenerating}
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
                    Avatar Videosu Oluştur
                    <span className="ml-3 px-2 py-0.5 bg-black/20 rounded-full text-xs">10 kredi</span>
                  </>
                )}
              </Button>
            </div>

            {/* Right: Result */}
            <div className="space-y-6">
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    Sonuç
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
                <div
                  className={cn(
                    'rounded-xl overflow-hidden bg-gradient-to-br from-[#1E1E1E] via-[#141414] to-[#1E1E1E] flex items-center justify-center border border-[#2A2A2A]',
                    aspectRatio === '16:9' && 'aspect-video',
                    aspectRatio === '9:16' && 'aspect-[9/16] max-h-[500px]',
                    aspectRatio === '1:1' && 'aspect-square max-h-[500px]'
                  )}
                >
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-purple-500/20" />
                        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-300">Avatar videosu oluşturuluyor</p>
                        <p className="text-xs text-gray-600 mt-1">Dudak senkronizasyonu yapılıyor...</p>
                      </div>
                    </div>
                  ) : result.state === 'success' && result.resultUrls?.length ? (
                    <div className="w-full h-full flex items-center justify-center bg-black/30">
                      <video src={result.resultUrls[0]} className="max-w-full max-h-full" controls autoPlay loop />
                    </div>
                  ) : result.state === 'fail' ? (
                    <div className="text-center p-8">
                      <p className="text-sm text-red-400">{result.failMsg}</p>
                      <Button size="sm" variant="outline" onClick={reset} className="mt-3 border-[#2A2A2A] text-gray-300 hover:text-white rounded-lg text-xs">
                        Tekrar Dene
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <User className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Avatar seçin ve metin yazın</p>
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
                    'Kısa ve net metinler daha doğal sonuç verir',
                    'Dil ile ses seçiminin eşleştiğinden emin olun',
                    'Dikey format sosyal medya için idealdir',
                    'Özel arka plan yükleyerek markanıza uygun hale getirin',
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
