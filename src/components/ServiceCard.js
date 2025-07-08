// src/components/ServiceCard.js
'use client';

// O ícone 'Mustache' foi corrigido aqui
import { Scissors, Sparkle, Combine, Gem, Palette, Wind, Mustache, Utensils, Brush, Award } from 'lucide-react';

// Mapa de ícones para associar o nome ao componente
const iconMap = {
  scissors: Scissors,
  sparkle: Sparkle,
  combine: Combine,
  gem: Gem,
  palette: Palette,
  wind: Wind,
  mustache: Mustache, // Nome corrigido
  utensils: Utensils,
  brush: Brush,
  award: Award,
};

export function ServiceCard({ iconName, title, price, duration }) {
  // Escolhe o componente do ícone com base no nome, ou usa 'scissors' como padrão
  const Icon = iconMap[iconName] || Scissors;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 flex flex-col items-center text-center gap-4 transition-all duration-300 hover:border-amber-500 hover:scale-[1.02]">
      <div className="bg-zinc-800 p-3 rounded-full border border-zinc-700">
        <Icon className="text-amber-500" size={28} />
      </div>
      <h3 className="font-display font-medium text-xl text-white tracking-wide">{title}</h3>
      <div className="font-sans flex items-center gap-4 text-zinc-400">
        <span className="text-lg font-bold text-amber-500">R$ {Number(price).toFixed(2)}</span>
        <span className="text-zinc-600">|</span>
        <span>{duration} min</span>
      </div>
    </div>
  );
}