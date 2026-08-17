import { AccentColor } from '../types/settings';

export interface AccentDefinition {
  id: AccentColor;
  name: string;
  primary: string;
  hover: string;
  rgb: string;
  glow: string;
  bgSubtle: string;
  borderSubtle: string;
  gradient: string;
}

export const ACCENT_PALETTE: Record<AccentColor, AccentDefinition> = {
  blue: {
    id: 'blue',
    name: 'Electric Blue',
    primary: '#3b82f6',
    hover: '#2563eb',
    rgb: '59, 130, 246',
    glow: 'rgba(59, 130, 246, 0.4)',
    bgSubtle: 'rgba(59, 130, 246, 0.15)',
    borderSubtle: 'rgba(59, 130, 246, 0.35)',
    gradient: 'from-blue-600 to-indigo-600',
  },
  purple: {
    id: 'purple',
    name: 'Deep Purple',
    primary: '#a855f7',
    hover: '#9333ea',
    rgb: '168, 85, 247',
    glow: 'rgba(168, 85, 247, 0.4)',
    bgSubtle: 'rgba(168, 85, 247, 0.15)',
    borderSubtle: 'rgba(168, 85, 247, 0.35)',
    gradient: 'from-purple-600 to-pink-600',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Green',
    primary: '#10b981',
    hover: '#059669',
    rgb: '16, 185, 129',
    glow: 'rgba(16, 185, 129, 0.4)',
    bgSubtle: 'rgba(16, 185, 129, 0.15)',
    borderSubtle: 'rgba(16, 185, 129, 0.35)',
    gradient: 'from-emerald-600 to-teal-600',
  },
  amber: {
    id: 'amber',
    name: 'Warm Amber',
    primary: '#f59e0b',
    hover: '#d97706',
    rgb: '245, 158, 11',
    glow: 'rgba(245, 158, 11, 0.4)',
    bgSubtle: 'rgba(245, 158, 11, 0.15)',
    borderSubtle: 'rgba(245, 158, 11, 0.35)',
    gradient: 'from-amber-500 to-orange-600',
  },
  rose: {
    id: 'rose',
    name: 'Neon Rose',
    primary: '#f43f5e',
    hover: '#e11d48',
    rgb: '244, 63, 94',
    glow: 'rgba(244, 63, 94, 0.4)',
    bgSubtle: 'rgba(244, 63, 94, 0.15)',
    borderSubtle: 'rgba(244, 63, 94, 0.35)',
    gradient: 'from-rose-500 to-pink-600',
  },
  cyan: {
    id: 'cyan',
    name: 'Cyan Teal',
    primary: '#06b6d4',
    hover: '#0891b2',
    rgb: '6, 182, 212',
    glow: 'rgba(6, 182, 212, 0.4)',
    bgSubtle: 'rgba(6, 182, 212, 0.15)',
    borderSubtle: 'rgba(6, 182, 212, 0.35)',
    gradient: 'from-cyan-500 to-blue-600',
  },
};

export function applyAccentToDOM(color: AccentColor) {
  if (typeof document === 'undefined') return;
  const accent = ACCENT_PALETTE[color] || ACCENT_PALETTE.blue;
  const root = document.documentElement;

  root.style.setProperty('--color-accent-primary', accent.primary);
  root.style.setProperty('--color-accent-hover', accent.hover);
  root.style.setProperty('--color-accent-rgb', accent.rgb);
  root.style.setProperty('--color-accent-glow', accent.glow);
  root.style.setProperty('--color-accent-subtle', accent.bgSubtle);
  root.style.setProperty('--color-accent-border', accent.borderSubtle);
  root.setAttribute('data-accent', color);
}
