'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  Zap,
  Crown,
  Infinity as InfinityIcon,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */

interface PlanFeature {
  label: string;
  free: boolean | string;
  pro: boolean | string;
  unlimited: boolean | string;
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/ay',
    description: 'Baslamak icin ideal',
    icon: Zap,
    cta: 'Mevcut Plan',
    ctaDisabled: true,
    highlight: false,
    credits: '20 kredi/ay',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/ay',
    description: 'Yaraticilar icin',
    icon: Crown,
    cta: 'Pro\'ya Gec',
    ctaDisabled: false,
    highlight: true,
    credits: '500 kredi/ay',
    badge: 'En Populer',
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '$79',
    period: '/ay',
    description: 'Sinirsiz potansiyel',
    icon: InfinityIcon,
    cta: 'Unlimited\'a Gec',
    ctaDisabled: false,
    highlight: false,
    credits: 'Sinirsiz kredi',
  },
];

const FEATURES: PlanFeature[] = [
  { label: 'Aylik Kredi', free: '20', pro: '500', unlimited: 'Sinirsiz' },
  { label: 'Video Cozunurlugu', free: '720p', pro: '1080p', unlimited: '4K' },
  { label: 'Video Suresi', free: '15sn', pro: '60sn', unlimited: 'Sinirsiz' },
  { label: 'Storyboard Kareleri', free: '4', pro: '25', unlimited: '50+' },
  { label: 'Referans Gorsel', free: '2', pro: '16', unlimited: '32' },
  { label: 'Gorsel Modelleri', free: 'Temel', pro: 'Tumu', unlimited: 'Tumu + Erken Erisim' },
  { label: 'Oncelikli Isleme', free: false, pro: false, unlimited: true },
  { label: 'API Erisimi', free: false, pro: true, unlimited: true },
  { label: 'Takim Isbirligi', free: false, pro: false, unlimited: true },
  { label: 'Oncelikli Destek', free: false, pro: false, unlimited: true },
  { label: 'Ozel Model Egitimi', free: false, pro: false, unlimited: true },
  { label: 'Filigran', free: 'Var', pro: 'Yok', unlimited: 'Yok' },
];

const FAQ = [
  {
    q: 'Kredi nedir ve nasil calisir?',
    a: 'Her video karesi uretimi belirli miktarda kredi harcar. Kare basina maliyet cozunurluge ve model secimine gore degisir. Ornegin, 1K cozunurlukte 1 kare ~0.8 kredi, 4K cozunurlukte ~3.2 kredi harcar. Krediler aylik olarak yenilenir ve kullanilmayan krediler bir sonraki aya devretmez.',
  },
  {
    q: 'Istedigim zaman plan degistirebilir miyim?',
    a: 'Evet! Planinizi istediginiz zaman yukseltebilir veya dusurebilirsiniz. Yukseltme aninda etkili olur ve mevcut fatura doneminden orantili ucretlendirme yapilir. Dusurme ise mevcut fatura doneminin sonunda etkili olur.',
  },
  {
    q: 'Ucretsiz deneme suresi var mi?',
    a: 'Pro ve Unlimited planlari 3 gunluk ucretsiz deneme sunar. Deneme suresi boyunca tum ozelliklere erisebilirsiniz. Memnun kalmazsaniz deneme suresi bitmeden iptal edebilirsiniz, herhangi bir ucret odemezsiniz.',
  },
  {
    q: 'Olusturdugum videolarin telif hakki kime ait?',
    a: 'Tum planlarda olusturdugunuz videolarin ticari kullanima dahil telif hakki size aittir. Free planda filigran bulunur, Pro ve Unlimited planlarda filigransiz olarak uretim yapabilirsiniz.',
  },
  {
    q: 'Kredi limitimi asarsam ne olur?',
    a: 'Kredi limitinize ulastiginizda yeni uretim yapamazsiniz, ancak mevcut projelerinize erisim devam eder. Ek kredi satin alabilir veya planinizi yukseltebilirsiniz. Unlimited planda sinir bulunmaz.',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  const { plan: currentPlan, credits } = useAppStore();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Pricing" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3" />
              %67 Tasarruf Firsati
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              Planinizi Secin
            </h1>
            <p className="text-gray-500 max-w-md mx-auto text-sm">
              Ihtiyaclariniza uygun plani secin ve AI destekli video uretimine baslayin.
              Istediginiz zaman degistirebilirsiniz.
            </p>
          </motion.div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'relative rounded-2xl border p-6 transition-all',
                  plan.highlight
                    ? 'border-purple-500/50 bg-[#141414] shadow-[0_0_30px_rgba(139,92,246,0.1)]'
                    : 'border-[#2A2A2A] bg-[#141414]'
                )}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-[10px] font-semibold uppercase tracking-wider">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        plan.highlight
                          ? 'bg-purple-500/15 border border-purple-500/30'
                          : 'bg-[#1E1E1E] border border-[#2A2A2A]'
                      )}
                    >
                      <plan.icon
                        className={cn(
                          'w-4 h-4',
                          plan.highlight ? 'text-purple-400' : 'text-gray-400'
                        )}
                      />
                    </div>
                    <h3 className="text-base font-semibold text-white">{plan.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-sm text-gray-500">{plan.period}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{plan.credits}</p>
                </div>

                {/* CTA */}
                <Button
                  disabled={plan.ctaDisabled || currentPlan === plan.id}
                  className={cn(
                    'w-full h-10 rounded-xl text-sm font-medium mb-5 transition-all',
                    plan.highlight
                      ? 'bg-[#00FF88] hover:bg-[#00E67A] text-black shadow-[0_0_15px_rgba(0,255,136,0.1)]'
                      : currentPlan === plan.id
                        ? 'bg-[#1E1E1E] text-gray-500 border border-[#2A2A2A] cursor-default'
                        : 'bg-[#1E1E1E] hover:bg-[#252525] text-white border border-[#2A2A2A]'
                  )}
                >
                  {currentPlan === plan.id ? 'Mevcut Plan' : plan.cta}
                </Button>

                {/* Feature highlights */}
                <ul className="space-y-2.5">
                  {[
                    plan.id === 'free' && 'Temel gorsel modelleri',
                    plan.id === 'free' && '720p video cikisi',
                    plan.id === 'pro' && 'Tum gorsel modelleri',
                    plan.id === 'pro' && '1080p Full HD cikis',
                    plan.id === 'pro' && 'API erisimi',
                    plan.id === 'unlimited' && 'Sinirsiz kredi kullanimi',
                    plan.id === 'unlimited' && '4K Ultra HD cikis',
                    plan.id === 'unlimited' && 'Oncelikli isleme',
                    plan.id === 'unlimited' && 'Takim isbirligi',
                    plan.id === 'unlimited' && 'Ozel model egitimi',
                  ]
                    .filter(Boolean)
                    .map((feature, j) => (
                      <li
                        key={j}
                        className="flex items-center gap-2 text-xs text-gray-400"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        {feature}
                      </li>
                    ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Feature comparison table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-lg font-semibold text-white mb-6 text-center">
              Ozellik Karsilastirmasi
            </h2>
            <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2A2A2A] bg-[#141414]">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 w-[40%]">
                      Ozellik
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 w-[20%]">
                      Free
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-purple-400 w-[20%]">
                      Pro
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 w-[20%]">
                      Unlimited
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map((feature, i) => (
                    <tr
                      key={i}
                      className={cn(
                        'border-b border-[#2A2A2A]/50',
                        i % 2 === 0 ? 'bg-[#0A0A0A]' : 'bg-[#141414]/50'
                      )}
                    >
                      <td className="py-3 px-4 text-xs text-gray-300">
                        {feature.label}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <FeatureCell value={feature.free} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <FeatureCell value={feature.pro} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <FeatureCell value={feature.unlimited} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto pb-12"
          >
            <h2 className="text-lg font-semibold text-white mb-6 text-center">
              Sik Sorulan Sorular
            </h2>
            <div className="space-y-2">
              {FAQ.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[#2A2A2A] bg-[#141414] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="text-sm text-white font-medium pr-4">
                      {item.q}
                    </span>
                    {openFaq === i ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4"
                    >
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature cell helper                                                 */
/* ------------------------------------------------------------------ */

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="text-xs text-gray-300">{value}</span>;
  }
  if (value) {
    return <Check className="w-4 h-4 text-emerald-400 mx-auto" />;
  }
  return <X className="w-4 h-4 text-gray-600 mx-auto" />;
}
