'use client';

import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Loader2,
  Mic,
  Play,
  Pause,
  Download,
  Volume2,
  Timer,
  Gauge,
  Zap,
  User,
  UserCircle,
  Check,
} from 'lucide-react';

const VOICES = Array.from({ length: 12 }, (_, i) => ({
  id: `voice-${i + 1}`,
  name: [
    'Elif', 'Ayşe', 'Zeynep', 'Ceren', 'Selin', 'Derya',
    'Mehmet', 'Ali', 'Burak', 'Emre', 'Can', 'Deniz',
  ][i],
  gender: i < 6 ? 'female' : 'male',
  language: ['tr', 'tr', 'en', 'tr', 'en', 'fr', 'tr', 'en', 'tr', 'de', 'tr', 'en'][i],
  accent: ['İstanbul', 'Ankara', 'American', 'İzmir', 'British', 'Paris', 'İstanbul', 'American', 'Bursa', 'Berlin', 'Antalya', 'Australian'][i],
  gradient: [
    'from-purple-400 to-pink-400',
    'from-blue-400 to-cyan-400',
    'from-green-400 to-emerald-400',
    'from-orange-400 to-red-400',
    'from-violet-400 to-purple-400',
    'from-teal-400 to-green-400',
    'from-indigo-400 to-blue-400',
    'from-amber-400 to-orange-400',
    'from-rose-400 to-pink-400',
    'from-sky-400 to-blue-400',
    'from-lime-400 to-green-400',
    'from-fuchsia-400 to-pink-400',
  ][i],
}));

const GENDER_FILTERS = [
  { value: 'all', label: 'Tümü' },
  { value: 'female', label: 'Kadın' },
  { value: 'male', label: 'Erkek' },
];

const LANGUAGE_FILTERS = [
  { value: 'all', label: 'Tüm Diller' },
  { value: 'tr', label: 'Türkçe' },
  { value: 'en', label: 'İngilizce' },
  { value: 'fr', label: 'Fransızca' },
  { value: 'de', label: 'Almanca' },
];

export default function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('voice-1');
  const [genderFilter, setGenderFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [speed, setSpeed] = useState([1.0]);
  const [pitch, setPitch] = useState([1.0]);
  const [pauseSetting, setPauseSetting] = useState('natural');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const filteredVoices = VOICES.filter((v) => {
    if (genderFilter !== 'all' && v.gender !== genderFilter) return false;
    if (languageFilter !== 'all' && v.language !== languageFilter) return false;
    return true;
  });

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 2500));
    setResult('generated');
    setIsGenerating(false);
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const creditCost = Math.max(1, Math.ceil(wordCount / 50));

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Seslendirme (TTS)" subtitle="Metninizi doğal sese dönüştürün" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input */}
            <div className="space-y-6">
              {/* Text Input */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                  <Mic className="w-4 h-4 text-purple-400" />
                  Metin
                </label>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Seslendirmesini istediğiniz metni buraya yazın. Doğal duraklamalar için noktalama işaretlerini kullanın..."
                  className="bg-[#1E1E1E] border-[#2A2A2A] text-white placeholder:text-gray-600 min-h-[140px] resize-none focus:border-purple-500/50"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-600">{wordCount} kelime</p>
                  <p className="text-xs text-purple-400">{creditCost} kredi</p>
                </div>
              </Card>

              {/* Voice Selector with Filters */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    Ses Seçin
                  </label>
                  <span className="text-xs text-gray-600">{filteredVoices.length} ses</span>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 mb-4">
                  <Select value={genderFilter} onValueChange={(v) => setGenderFilter(v ?? 'all')}>
                    <SelectTrigger className="bg-[#1E1E1E] border-[#2A2A2A] text-gray-300 h-8 text-xs focus:border-purple-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E1E1E] border-[#2A2A2A]">
                      {GENDER_FILTERS.map((f) => (
                        <SelectItem key={f.value} value={f.value} className="text-white focus:bg-[#2A2A2A] focus:text-white text-xs">
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={languageFilter} onValueChange={(v) => setLanguageFilter(v ?? 'all')}>
                    <SelectTrigger className="bg-[#1E1E1E] border-[#2A2A2A] text-gray-300 h-8 text-xs focus:border-purple-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E1E1E] border-[#2A2A2A]">
                      {LANGUAGE_FILTERS.map((f) => (
                        <SelectItem key={f.value} value={f.value} className="text-white focus:bg-[#2A2A2A] focus:text-white text-xs">
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Voice Grid */}
                <div className="grid grid-cols-4 gap-2 max-h-[280px] overflow-y-auto pr-1">
                  {filteredVoices.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice.id)}
                      className={cn(
                        'relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
                        selectedVoice === voice.id
                          ? 'border-purple-500/60 bg-purple-500/10'
                          : 'border-[#2A2A2A] bg-[#1E1E1E] hover:border-[#3A3A3A]'
                      )}
                    >
                      <div className={cn('w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center', voice.gradient)}>
                        {voice.gender === 'female' ? (
                          <UserCircle className="w-5 h-5 text-white/80" />
                        ) : (
                          <User className="w-5 h-5 text-white/80" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className={cn('text-xs font-medium', selectedVoice === voice.id ? 'text-white' : 'text-gray-300')}>
                          {voice.name}
                        </p>
                        <p className="text-[9px] text-gray-600">{voice.accent}</p>
                      </div>
                      {selectedVoice === voice.id && (
                        <div className="absolute top-1.5 right-1.5">
                          <Check className="w-3 h-3 text-purple-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Speed / Pitch Sliders */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-purple-400" />
                      Hız
                    </label>
                    <span className="text-xs text-purple-400">{speed[0].toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={(v) => setSpeed(Array.isArray(v) ? v : [v])}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="[&_[role=slider]]:bg-purple-500 [&_[role=slider]]:border-purple-400"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-gray-600">Yavaş</span>
                    <span className="text-[10px] text-gray-600">Hızlı</span>
                  </div>
                </Card>

                <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-purple-400" />
                      Perde
                    </label>
                    <span className="text-xs text-purple-400">{pitch[0].toFixed(1)}</span>
                  </div>
                  <Slider
                    value={pitch}
                    onValueChange={(v) => setPitch(Array.isArray(v) ? v : [v])}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="[&_[role=slider]]:bg-purple-500 [&_[role=slider]]:border-purple-400"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-gray-600">Alçak</span>
                    <span className="text-[10px] text-gray-600">Yüksek</span>
                  </div>
                </Card>
              </div>

              {/* Pause Setting */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block flex items-center gap-2">
                  <Timer className="w-4 h-4 text-purple-400" />
                  Duraklama
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'natural', label: 'Doğal', desc: 'Noktalama ile durakla' },
                    { value: 'fast', label: 'Hızlı', desc: 'Minimum duraklama' },
                    { value: 'slow', label: 'Yavaş', desc: 'Uzun duraklamalar' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPauseSetting(opt.value)}
                      className={cn(
                        'p-3 rounded-xl border transition-all text-center',
                        pauseSetting === opt.value
                          ? 'border-purple-500/60 bg-purple-500/10'
                          : 'border-[#2A2A2A] bg-[#1E1E1E] hover:border-[#3A3A3A]'
                      )}
                    >
                      <p className={cn('text-xs font-medium', pauseSetting === opt.value ? 'text-white' : 'text-gray-400')}>
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-gray-600 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Generate */}
              <Button
                onClick={handleGenerate}
                disabled={!text.trim() || isGenerating}
                className="w-full h-12 bg-[#00FF88] hover:bg-[#00DD77] text-black font-semibold text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Seslendiriliyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Ses Oluştur
                    <span className="ml-3 px-2 py-0.5 bg-black/20 rounded-full text-xs">
                      {creditCost} kredi
                    </span>
                  </>
                )}
              </Button>
            </div>

            {/* Right: Result */}
            <div className="space-y-6">
              <Card className="bg-[#141414] border-[#2A2A2A] p-5">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-purple-400" />
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
                  <div className="h-48 rounded-xl bg-[#1E1E1E] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-purple-500/20" />
                        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-300">Ses oluşturuluyor</p>
                        <p className="text-xs text-gray-600 mt-1">Bu işlem birkaç saniye sürebilir</p>
                      </div>
                    </div>
                  </div>
                ) : result ? (
                  <div className="space-y-4">
                    {/* Audio Waveform Placeholder */}
                    <div className="h-24 rounded-xl bg-gradient-to-r from-purple-500/20 via-[#1E1E1E] to-purple-500/20 flex items-center justify-center border border-[#2A2A2A]">
                      <div className="flex items-center gap-[3px]">
                        {Array.from({ length: 40 }, (_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-purple-500/60 rounded-full"
                            style={{
                              height: `${Math.random() * 50 + 10}px`,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Audio Player Controls */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A]">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 text-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="w-full h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                          <div className="h-full w-1/3 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-gray-600">0:00</span>
                          <span className="text-[10px] text-gray-600">
                            {wordCount > 0 ? `~${Math.ceil(wordCount / 2.5)}s` : '0:00'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#2A2A2A] text-gray-300 hover:text-white rounded-lg h-8"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          <span className="text-xs">MP3</span>
                        </Button>
                      </div>
                    </div>

                    {/* Voice Info */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-[10px] text-gray-500">Ses</p>
                        <p className="text-xs text-white mt-0.5">
                          {VOICES.find((v) => v.id === selectedVoice)?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Hız</p>
                        <p className="text-xs text-white mt-0.5">{speed[0].toFixed(1)}x</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Perde</p>
                        <p className="text-xs text-white mt-0.5">{pitch[0].toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 rounded-xl bg-gradient-to-br from-[#1E1E1E] via-[#141414] to-[#1E1E1E] flex items-center justify-center border border-[#2A2A2A]">
                    <div className="text-center">
                      <Mic className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Metin yazın ve ses seçin</p>
                      <p className="text-xs text-gray-700 mt-1">Önizleme burada görünecek</p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Credit Info */}
              <Card className="bg-[#141414] border-[#2A2A2A] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-medium text-gray-300">Kredi Hesaplaması</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Kelime sayısı</span>
                    <span className="text-gray-300">{wordCount}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Kredi oranı</span>
                    <span className="text-gray-300">50 kelime / 1 kredi</span>
                  </div>
                  <div className="h-px bg-[#2A2A2A] my-1" />
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300 font-medium">Toplam kredi</span>
                    <span className="text-purple-400 font-medium">{creditCost}</span>
                  </div>
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
                    'Noktalama işaretleri doğal duraklamalar oluşturur',
                    'Kısa cümleler daha doğal sonuç verir',
                    'Farklı sesleri deneyerek en uygun olanı bulun',
                    'Hız ve perde ayarları sesi özelleştirir',
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
