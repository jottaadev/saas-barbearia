// src/app/login/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Loader } from 'lucide-react';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('isStoreLoggedIn') === 'true') {
      router.push('/painel/selecao-perfil');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Usa a variável de ambiente para o endereço da API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${apiUrl}/api/store/login`, { username, password });

      if (remember) {
        localStorage.setItem('isStoreLoggedIn', 'true');
      }
      router.push('/painel/selecao-perfil');

    } catch (err) {
      setError('Utilizador ou senha da estação inválidos.');
    } finally {
        setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-950 min-h-screen flex flex-col items-center justify-center text-white">
        <Loader className="animate-spin text-amber-500" size={48} />
        <p className="mt-4 font-sans">A verificar estação de trabalho...</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-white font-sans flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/"><h1 className="font-display font-bold text-4xl text-amber-500">Barbearia Premium</h1></Link>
          <p className="font-sans text-zinc-400 mt-2">Acesso à Estação de Trabalho</p>
        </div>
        <form onSubmit={handleLogin} className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1" htmlFor="username">Utilizador da Estação</label>
              <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1" htmlFor="password">Senha da Estação</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div className="flex items-center">
            <input id="remember" name="remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-zinc-600 text-amber-500 focus:ring-amber-500 bg-zinc-700"/>
            <label htmlFor="remember" className="ml-2 block text-sm text-zinc-400">Lembrar desta estação</label>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 font-bold bg-amber-500 text-zinc-950 py-3 px-8 rounded-full disabled:bg-zinc-700 disabled:cursor-not-allowed hover:bg-amber-400 transition-colors">
              {isLoading ? 'A entrar...' : 'Entrar'} <LogIn size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}