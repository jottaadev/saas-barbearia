// src/components/ServiceCard.js
'use client';

// Ícone correto é 'Beard'
import { Scissors, Sparkle, Combine, Gem, Palette, Wind, Beard, Utensils, Brush, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const iconMap = {
  scissors: Scissors, sparkle: Sparkle, combine: Combine, gem: Gem,
  palette: Palette, wind: Wind, beard: Beard, // Usando o nome correto
  utensils: Utensils, brush: Brush, award: Award,
};

export function ServiceCard({ service }) {
  const Icon = iconMap[service.icon_name] || Scissors;

  return (
    <div 
      className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm 
                 flex flex-col text-left transition-all duration-300 hover:border-amber-500/80 hover:bg-zinc-900 hover:-translate-y-2"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-700">
          <Icon className="text-amber-500" size={24} />
        </div>
        <h3 className="font-display font-bold text-xl text-white">{service.name}</h3>
      </div>
      
      <p className="font-sans text-zinc-400 text-sm flex-grow mb-5">
        {service.description || 'Os melhores produtos e técnicas para um resultado impecável.'}
      </p>

      <div className="flex items-center justify-between mt-auto">
          <p className="font-display font-bold text-2xl text-amber-400">R$ {Number(service.price).toFixed(2)}</p>
          <span className="text-sm text-zinc-500">{service.duration_minutes} min</span>
      </div>

       <Link 
        href={`/agendamento?servico=${service.id}`} 
        className="group mt-5 w-full text-center bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold py-2.5 px-4 rounded-lg
                   hover:bg-amber-500 hover:text-black transition-all duration-300 flex items-center justify-center gap-2"
      >
        Agendar <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  );
};