// src/components/painel/Sidebar.js
'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Scissors, Users, Calendar, LogOut, BarChart3, Clock, History, X } from 'lucide-react';

// Adicionamos as props 'isOpen' e 'setIsOpen'
export function Sidebar({ user, isOpen, setIsOpen }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    router.push('/painel/selecao-perfil');
  };
  
  const adminLinks = [
    { href: '/painel', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/painel/servicos', label: 'Serviços', icon: Scissors },
    { href: '/painel/equipa', label: 'Equipe', icon: Users },
    { href: '/painel/agenda-completa', label: 'Agenda Completa', icon: Calendar },
    { href: '/painel/relatorios', label: 'Relatórios', icon: BarChart3 },
  ];

  const barberLinks = [
    { href: '/painel', label: 'Minha Agenda', icon: Calendar },
    { href: '/painel/meus-horarios', label: 'Meus Horários', icon: Clock },
    { href: '/painel/meu-historico', label: 'Meu Histórico', icon: History },
  ];

  const links = user?.role === 'admin' ? adminLinks : barberLinks;

  return (
    <>
      {/* Overlay para ecrãs pequenos. Fecha a sidebar ao clicar fora. */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <aside
        className={`w-64 bg-zinc-900 p-6 flex flex-col border-r border-zinc-800 
                   fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out
                   md:relative md:translate-x-0 
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex justify-between items-center pb-6 border-b border-zinc-800">
          <div>
            <h2 className="font-display font-bold text-xl text-white truncate">{user?.name || 'Utilizador'}</h2>
            <p className="font-sans text-sm text-amber-500 capitalize">{user?.role === 'admin' ? 'Administrador' : 'Barbeiro'}</p>
          </div>
          {/* Botão para fechar a sidebar em mobile */}
          <button onClick={() => setIsOpen(false)} className="md:hidden p-1">
            <X className="text-zinc-400" />
          </button>
        </div>
        <nav className="flex-1 space-y-2 mt-8">
          {links.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 rounded-md px-3 py-2.5 font-sans font-medium text-zinc-300 transition-all hover:text-white hover:bg-zinc-800 ${isActive ? 'bg-amber-500/10 text-amber-400' : ''}`}>
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="pt-6 mt-6">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-zinc-400 transition-all hover:text-white hover:bg-red-900/50">
            <LogOut className="h-5 w-5" />
            Mudar de Utilizador
          </button>
        </div>
      </aside>
    </>
  );
}