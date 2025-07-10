// src/components/painel/Sidebar.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Scissors, Users, Calendar, LogOut, 
  BarChart3, Clock, History, X, Menu 
} from 'lucide-react';

export function Sidebar({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    router.push('/painel/selecao-perfil');
  };
  
  const adminLinks = [
    { href: '/painel', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/painel/servicos', label: 'Serviços', icon: Scissors },
    { href: '/painel/equipa', label: 'Equipa', icon: Users },
    { href: '/painel/agenda-completa', label: 'Agenda Completa', icon: Calendar },
    { href: '/painel/relatorios', label: 'Relatórios', icon: BarChart3 },
  ];

  const barberLinks = [
    { href: '/painel', label: 'Minha Agenda', icon: Calendar },
    { href: '/painel/meus-horarios', label: 'Meus Horários', icon: Clock },
    { href: '/painel/meu-historico', label: 'Meu Histórico', icon: History },
  ];

  const links = user?.role === 'admin' ? adminLinks : barberLinks;

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Botão de Menu Flutuante para Mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 fixed top-4 left-4 z-20 bg-zinc-900/80 backdrop-blur-sm rounded-md border border-zinc-700"
        aria-label="Abrir menu"
      >
        <Menu className="text-white" />
      </button>

      {/* Overlay que cobre a página quando o menu está aberto em mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* A Sidebar em si, com o novo design */}
      <aside
        className={`w-64 bg-zinc-950 p-4 flex-shrink-0 flex flex-col 
                   fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out
                   md:relative md:translate-x-0 md:bg-transparent md:p-6
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="bg-zinc-900 rounded-xl p-4 flex-grow flex flex-col border border-zinc-800 shadow-2xl shadow-black/20">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
            <div>
              <h2 className="font-display font-bold text-xl text-white truncate">{user?.name || 'Utilizador'}</h2>
              <p className="font-sans text-sm text-amber-500 capitalize">{user?.role === 'admin' ? 'Administrador' : 'Barbeiro'}</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="md:hidden p-1">
              <X className="text-zinc-400" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 mt-6">
            {links.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  onClick={handleLinkClick} 
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 font-sans font-medium text-zinc-300 transition-all duration-200
                              hover:text-white hover:bg-zinc-800/50
                              ${isActive ? 'bg-amber-500/10 text-amber-400' : ''}`}
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="pt-4 mt-4 border-t border-zinc-800">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-zinc-400 transition-all hover:text-white hover:bg-red-900/50">
              <LogOut className="h-5 w-5" />
              Mudar de Utilizador
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
