import { Package, Layers, MonitorPlay, Music2, ShieldCheck, Video } from 'lucide-react';

const normalize = (value) => (value || '').toString().trim().toLowerCase();

const byName = (name) => {
  const n = normalize(name);

  // Streaming / OTT
  if (n.includes('netflix')) return { key: 'netflix', bg: 'bg-red-600', fg: 'text-white', label: 'N', icon: Video };
  if (n.includes('disney') || n.includes('hotstar')) return { key: 'disney', bg: 'bg-indigo-600', fg: 'text-white', label: 'D+', icon: MonitorPlay };
  if (n.includes('prime')) return { key: 'prime', bg: 'bg-sky-600', fg: 'text-white', label: 'P', icon: Video };
  if (n.includes('sonyliv') || n.includes('sony')) return { key: 'sonyliv', bg: 'bg-fuchsia-600', fg: 'text-white', label: 'S', icon: MonitorPlay };
  if (n.includes('zee5') || n.includes('zee')) return { key: 'zee5', bg: 'bg-zinc-900', fg: 'text-white', label: 'Z', icon: MonitorPlay };

  // Music
  if (n.includes('spotify')) return { key: 'spotify', bg: 'bg-green-600', fg: 'text-white', label: 'S', icon: Music2 };
  if (n.includes('youtube')) return { key: 'youtube', bg: 'bg-red-500', fg: 'text-white', label: 'Y', icon: Video };
  if (n.includes('apple music') || (n.includes('apple') && n.includes('music'))) return { key: 'apple-music', bg: 'bg-neutral-900', fg: 'text-white', label: '', icon: Music2 };

  // SaaS
  if (n.includes('adobe')) return { key: 'adobe', bg: 'bg-red-700', fg: 'text-white', label: 'A', icon: Layers };
  if (n.includes('microsoft') || n.includes('365')) return { key: 'm365', bg: 'bg-blue-700', fg: 'text-white', label: 'M', icon: ShieldCheck };

  return null;
};

const byType = (type) => {
  const t = normalize(type);
  if (t === 'service') return { bg: 'bg-primary', fg: 'text-primary-foreground', label: null, icon: Layers };
  if (t === 'saas') return { bg: 'bg-blue-600', fg: 'text-white', label: null, icon: Package };
  if (t === 'license') return { bg: 'bg-purple-600', fg: 'text-white', label: null, icon: ShieldCheck };
  return { bg: 'bg-muted', fg: 'text-muted-foreground', label: null, icon: Package };
};

export function ProductAvatar({ product, name, type, size = 44, className = '' }) {
  const productName = name ?? product?.name ?? '';
  const productType = type ?? product?.type ?? '';

  const mapped = byName(productName) || byType(productType);
  const Icon = mapped.icon || Package;

  const px = Math.max(28, Math.min(72, Number(size) || 44));
  const iconSize = Math.round(px * 0.5);

  return (
    <div
      className={`shrink-0 rounded-xl ${mapped.bg} ${mapped.fg} grid place-items-center shadow-sm ${className}`}
      style={{ width: px, height: px }}
      aria-label={productName}
      title={productName}
    >
      {mapped.label ? (
        <span className="font-extrabold tracking-tight" style={{ fontSize: Math.round(px * 0.42) }}>
          {mapped.label}
        </span>
      ) : (
        <Icon size={iconSize} />
      )}
    </div>
  );
}
