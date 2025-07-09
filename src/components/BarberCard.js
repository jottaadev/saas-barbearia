// src/components/BarberCard.js
'use client';
import Image from 'next/image';

export function BarberCard({ imageSrc, name, specialty }) {
  return (
    <div className="relative h-96 w-full rounded-xl overflow-hidden group">
      <Image 
        src={imageSrc} 
        alt={`Foto do barbeiro ${name}`} 
        fill 
        style={{ objectFit: 'cover' }} 
        className="transition-all duration-500 group-hover:scale-110" 
      />
      {/* Gradiente para garantir a legibilidade do texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>

      {/* Conteúdo que aparece na parte inferior */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="font-display font-bold text-2xl text-white tracking-wide">{name}</h3>
        <p className="font-sans text-amber-400 transition-colors duration-300 group-hover:text-amber-300">{specialty}</p>
      </div>
    </div>
  );
}