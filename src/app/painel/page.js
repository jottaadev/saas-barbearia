// src/app/painel/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { Sidebar } from '@/components/painel/Sidebar';
import { AdminDashboard } from '@/components/painel/AdminDashboard';
import { BarberDashboard } from '@/components/painel/BarberDashboard';

export default function PainelPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      router.push('/painel/selecao-perfil');
      return;
    }
    try {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
    } catch (error) {
      sessionStorage.removeItem('authToken');
      router.push('/painel/selecao-perfil');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading || !user) {
    return <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-white">A verificar autenticação...</div>;
  }

  return (
    // A estrutura principal agora é apenas 'flex'. A sidebar e o main controlam o seu próprio espaço.
    <div className="bg-zinc-950 min-h-screen text-white flex font-sans">
      <Sidebar user={user} />
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        <div className="animate-fade-in">
          {user.role === 'admin' && <AdminDashboard />}
          {user.role === 'barber' && <BarberDashboard />}
        </div>
      </main>
    </div>
  );
}