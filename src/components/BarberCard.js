// src/components/BarberCard.js
'use client';
import Image from 'next/image';

export function BarberCard({ imageSrc, name, specialty }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden text-center group transition-all duration-300 hover:border-amber-500">
      <div className="relative h-80 w-full overflow-hidden">
        <Image src={imageSrc} alt={`Foto do barbeiro ${name}`} fill style={{ objectFit: 'cover' }} className="transition-all duration-500" />
      </div>
      <div className="p-5">
        {/* Nome do barbeiro com a nova fonte */}
        <h3 className="font-title font-medium text-2xl text-white tracking-wide">{name}</h3>
        <p className="font-sans text-amber-500">{specialty}</p>
      </div>
    </div>
  );
}