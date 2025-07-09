// src/components/Footer.js
'use client';
import { Instagram, Scissors } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black text-zinc-500 py-10 px-6 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
            <Scissors className="text-amber-500" size={18}/>
            <p className="font-sans text-sm">Duarte Barbearia &copy; {new Date().getFullYear()}</p>
        </div>
        
        <div className="flex gap-5">
          <a href="#" aria-label="Instagram" className="hover:text-amber-400 transition-colors">
            <Instagram size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}