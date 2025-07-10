// src/app/painel/servicos/page.js
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, AlertCircle, Scissors, Sparkle, Combine, Gem, Palette, Wind, UserCircle, Utensils, Brush, Award } from 'lucide-react';
import { Sidebar } from '@/components/painel/Sidebar';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

const iconSuggestions = [
  { name: 'scissors', label: 'Tesoura', Icon: Scissors }, { name: 'sparkle', label: 'Brilho', Icon: Sparkle }, { name: 'combine', label: 'Combo', Icon: Combine },
  { name: 'beard', label: 'Barba', Icon: UserCircle }, { name: 'utensils', label: 'Navalha', Icon: Utensils }, { name: 'brush', label: 'Pincel', Icon: Brush },
  { name: 'gem', label: 'Premium', Icon: Gem }, { name: 'award', label: 'Destaque', Icon: Award },
].filter(icon => icon.Icon);

const ServiceModal = ({ service, onClose, onSave, error }) => {
    // Código do Modal não precisa de alterações
    return (<></>); // Omitido para clareza, mantenha o seu código aqui
};

export default function GerirServicosPage() {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const router = useRouter();

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://backend-barber-5sbe.onrender.com/api/services');
      setServices(response.data);
    } catch (err) {
      setError('Não foi possível carregar os serviços.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (!token) { router.push('/painel/selecao-perfil'); return; }
    try {
      const decodedUser = jwtDecode(token);
      if (decodedUser.role !== 'admin') { router.push('/painel'); return; }
      setUser(decodedUser);
      fetchServices();
    } catch (error) {
      router.push('/painel/selecao-perfil');
    }
  }, [router]);

  // ... (Todos os seus handlers: handleSaveService, handleDeleteService, etc. continuam aqui sem alterações)

  if (isLoading || !user) {
    return <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-white">A carregar...</div>;
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-white flex font-sans">
      <Sidebar user={user} />
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display font-bold text-4xl text-white">Gerir Serviços</h1>
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-amber-500 text-zinc-950 font-bold py-2 px-4 rounded-lg hover:bg-amber-400 transition-colors">
            <Plus size={20} />
            Adicionar Serviço
          </button>
        </div>
        {error && <div className="bg-red-900/20 text-red-400 p-4 rounded-lg flex items-center gap-3 mb-6"><AlertCircle size={20}/> {error}</div>}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
          <table className="w-full text-left">
             {/* O conteúdo da sua tabela vem aqui */}
          </table>
        </div>
        {isModalOpen && <ServiceModal service={editingService} onClose={() => setIsModalOpen(false)} onSave={handleSaveService} error={modalError} />}
      </main>
    </div>
  );
}