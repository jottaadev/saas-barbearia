// src/components/Footer.js
'use client';
import { Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <a href="#" className="font-alt text-3xl text-amber-500">
            Duarte Barbearia
          </a>
          <p className="font-sans text-sm">© {new Date().getFullYear()} Todos os direitos reservados.</p>
        </div>
        
        {/* Apenas o Instagram ficou */}
        <div className="flex gap-6">
          <a href="#" className="hover:text-amber-500 transition-colors">
            <Instagram size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
}