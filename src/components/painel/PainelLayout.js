// src/components/painel/PainelLayout.js
'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

export function PainelLayout({ user, children }) {
  // Estado para controlar se a sidebar está aberta ou fechada em mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-zinc-950 min-h-screen text-white flex font-sans">
      {/* Sidebar */}
      <Sidebar user={user} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        {/* Botão de Menu para Mobile */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden p-2 fixed top-4 left-4 z-20 bg-zinc-900 rounded-md border border-zinc-800"
          aria-label="Abrir menu"
        >
          <Menu className="text-white" />
        </button>

        {/* O conteúdo da página específica será renderizado aqui */}
        {children}
      </main>
    </div>
  );
}