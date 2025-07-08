// src/app/painel/selecao-perfil/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { User, ShieldCheck, LogOut } from 'lucide-react';

export default function ProfileSelectionPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('isStoreLoggedIn') !== 'true') {
      router.push('/login');
      return;
    }
    async function fetchProfiles() {
      try {
        const response = await axios.get('http://localhost:3333/api/users/profiles');
        setProfiles(response.data);
      } catch (err) {
        setError("Não foi possível carregar os perfis. Verifique se o servidor backend está a correr.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfiles();
  }, [router]);

  const handleProfileSelect = (profile) => {
    if (profile.role === 'barber') {
      loginAsBarber(profile);
    } else {
      setSelectedProfile(profile);
      setError('');
      setPassword('');
    }
  };

  const loginAsBarber = async (profile) => {
    setIsLoggingIn(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:3333/api/auth/profile-login', { userId: profile.id });
      // --- ALTERAÇÃO AQUI: Guardamos no sessionStorage ---
      sessionStorage.setItem('authToken', response.data.token);
      router.push('/painel');
    } catch (err) {
      setError(`Não foi possível fazer o login no perfil de ${profile.name}.`);
      setIsLoggingIn(false);
    }
  };

  const loginAsAdmin = async (e) => {
    e.preventDefault();
    if (!selectedProfile) return;
    setIsLoggingIn(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:3333/api/auth/login', {
        username: selectedProfile.username,
        password: password,
      });
      // --- ALTERAÇÃO AQUI: Guardamos no sessionStorage ---
      sessionStorage.setItem('authToken', response.data.token);
      router.push('/painel');
    } catch (err) {
      setError('Senha de administrador inválida.');
      setIsLoggingIn(false);
    }
  };
  
  const handleLogoutStation = () => {
    localStorage.removeItem('isStoreLoggedIn');
    router.push('/login');
  };

  const renderProfileIcon = (profile) => {
    const Icon = profile.role === 'admin' ? ShieldCheck : User;
    const imageUrl = profile.avatar_url ? `http://localhost:3333${profile.avatar_url}` : null;
    if (imageUrl) {
      return <img src={imageUrl} alt={profile.name} className="w-24 h-24 rounded-full object-cover" />;
    }
    return <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center"><Icon className="text-zinc-500" size={48} /></div>;
  };

  if (isLoading) {
    return <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-white">A carregar perfis...</div>;
  }

  return (
    <div className="bg-zinc-950 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-2">Quem está a trabalhar?</h1>
        <p className="font-sans text-zinc-400 mb-12">Selecione o seu perfil para continuar</p>
        
        {error && !selectedProfile && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {profiles.map(profile => (
            <button key={profile.id} onClick={() => handleProfileSelect(profile)} 
              className="flex flex-col items-center justify-start gap-3 p-4 rounded-lg bg-zinc-900 transition-all duration-300 border-2 border-zinc-800 hover:border-amber-500 hover:scale-105 group disabled:opacity-50"
              disabled={isLoggingIn}>
              {renderProfileIcon(profile)}
              <span className="font-sans font-medium text-white group-hover:text-amber-500 transition-colors">{profile.name}</span>
              {profile.role === 'admin' && <div className="text-xs font-bold text-amber-500">Admin</div>}
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
            <button onClick={handleLogoutStation} className="text-sm text-zinc-500 hover:text-amber-500 transition-colors flex items-center gap-2 mx-auto">
                <LogOut size={16} /> Encerrar Estação de Trabalho
            </button>
        </div>

        {selectedProfile && selectedProfile.role === 'admin' && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 animate-fade-in z-50" onClick={() => setSelectedProfile(null)}>
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-lg w-full max-w-sm text-center relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedProfile(null)} className="absolute top-2 right-2 text-zinc-500 hover:text-white p-2">&times;</button>
              <div className="mx-auto mb-4">{renderProfileIcon(selectedProfile)}</div>
              <h2 className="font-display font-bold text-xl text-white mb-2">Olá, {selectedProfile.name}!</h2>
              <p className="font-sans text-zinc-400 mb-6">Insira a sua senha de administrador.</p>
              <form onSubmit={loginAsAdmin}>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full text-center p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white mb-4" autoFocus />
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="flex gap-4">
                  <button type="button" onClick={() => setSelectedProfile(null)} className="w-full py-3 rounded-lg bg-zinc-700 hover:bg-zinc-600 font-bold">Cancelar</button>
                  <button type="submit" disabled={isLoggingIn} className="w-full py-3 rounded-lg bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400">
                    {isLoggingIn ? 'A entrar...' : 'Entrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}