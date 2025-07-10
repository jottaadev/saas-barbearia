// src/app/painel/servicos/page.js
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Ícone 'Beard' (Barba) é o correto.
import { Plus, Edit, Trash2, AlertCircle, Scissors, Sparkle, Combine, Gem, Palette, Wind, Beard, Utensils, Brush, Award } from 'lucide-react';
import { Sidebar } from '@/components/painel/Sidebar';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

const iconSuggestions = [
  { name: 'scissors', label: 'Tesoura', Icon: Scissors }, { name: 'sparkle', label: 'Brilho', Icon: Sparkle }, { name: 'combine', label: 'Combo', Icon: Combine },
  { name: 'beard', label: 'Barba', Icon: Beard }, // Usando o nome correto
  { name: 'utensils', label: 'Navalha', Icon: Utensils }, { name: 'brush', label: 'Pincel', Icon: Brush },
  { name: 'gem', label: 'Premium', Icon: Gem }, { name: 'award', label: 'Destaque', Icon: Award },
].filter(icon => icon.Icon);

const ServiceModal = ({ service, onClose, onSave, error }) => {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || '',
    duration_minutes: service?.duration_minutes || '',
    icon_name: service?.icon_name || 'scissors',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-lg w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">&times;</button>
        <h2 className="font-display font-bold text-2xl text-white mb-6">{service ? 'Editar Serviço' : 'Adicionar Novo Serviço'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-400" htmlFor="name">Nome do Serviço</label>
            <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: Corte Masculino Moderno" required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-400" htmlFor="description">Descrição</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Uma breve descrição do que o serviço inclui." className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg h-24 mt-1"></textarea>
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
                <label className="text-sm font-medium text-zinc-400" htmlFor="price">Preço (R$)</label>
                <input id="price" type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} placeholder="50.00" required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg mt-1" />
            </div>
            <div className="w-1/2">
                <label className="text-sm font-medium text-zinc-400" htmlFor="duration_minutes">Duração (min)</label>
                <input id="duration_minutes" type="number" name="duration_minutes" value={formData.duration_minutes} onChange={handleChange} placeholder="45" required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-400">Ícone do Serviço</label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-2">
                {iconSuggestions.map(({name, Icon}) => (
                    <button type="button" key={name} title={name} onClick={() => handleChange({target: {name: 'icon_name', value: name}})}
                        className={`p-3 border-2 rounded-lg flex items-center justify-center transition-all ${formData.icon_name === name ? 'border-amber-500 bg-amber-500/10 scale-110' : 'border-zinc-700 hover:border-zinc-600'}`}>
                        <Icon className="text-white" size={24} />
                    </button>
                ))}
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-6 rounded-lg bg-zinc-700 hover:bg-zinc-600 font-bold">Cancelar</button>
            <button type="submit" className="py-2 px-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
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
    if (!token) {
      router.push('/painel/selecao-perfil');
      return;
    }
    try {
      const decodedUser = jwtDecode(token);
      if (decodedUser.role !== 'admin') {
        router.push('/painel');
        return;
      }
      setUser(decodedUser);
      fetchServices();
    } catch (error) {
      sessionStorage.removeItem('authToken');
      router.push('/painel/selecao-perfil');
    }
  }, [router]);

  const handleSaveService = async (formData) => {
    const token = sessionStorage.getItem('authToken');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const url = editingService
      ? `https://backend-barber-5sbe.onrender.com/api/services/${editingService.id}`
      : 'https://backend-barber-5sbe.onrender.com/api/services';
    const method = editingService ? 'put' : 'post';

    try {
      await axios[method](url, formData, config);
      setIsModalOpen(false);
      setEditingService(null);
      fetchServices();
      setModalError('');
    } catch (err) {
      setModalError(err.response?.data?.error || 'Não foi possível salvar o serviço.');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Tem a certeza que quer apagar este serviço?')) {
      const token = sessionStorage.getItem('authToken');
      try {
        await axios.delete(`https://backend-barber-5sbe.onrender.com/api/services/${serviceId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchServices();
      } catch (err) {
        setError(err.response?.data?.error || 'Não foi possível apagar o serviço.');
      }
    }
  };
  
  const handleOpenModal = (service = null) => {
    setEditingService(service);
    setIsModalOpen(true);
    setModalError('');
  };

  if (isLoading || !user) {
    return (
      <div className="bg-zinc-950 min-h-screen text-white flex">
        {user && <Sidebar user={user} />}
        <main className="flex-1 p-8">
            <h1 className="font-display font-bold text-4xl text-white">A carregar...</h1>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-white flex font-sans">
      <Sidebar user={user} />
      <main className="flex-1 p-8">
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
            <thead className="bg-zinc-800">
              <tr>
                <th className="p-4 font-bold text-sm text-zinc-400 uppercase">Nome</th>
                <th className="p-4 font-bold text-sm text-zinc-400 uppercase">Preço</th>
                <th className="p-4 font-bold text-sm text-zinc-400 uppercase">Duração</th>
                <th className="p-4 font-bold text-sm text-zinc-400 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                  <td className="p-4 font-medium text-white">{service.name}</td>
                  <td className="p-4 text-zinc-300">R$ {Number(service.price).toFixed(2)}</td>
                  <td className="p-4 text-zinc-300">{service.duration_minutes} min</td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(service)} className="px-3 py-1 text-sm font-bold text-blue-400 hover:bg-blue-900/50 rounded-md transition-colors">Editar</button>
                    <button onClick={() => handleDeleteService(service.id)} className="px-3 py-1 text-sm font-bold text-red-500 hover:bg-red-900/50 rounded-md transition-colors">Apagar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      {isModalOpen && <ServiceModal service={editingService} onClose={() => setIsModalOpen(false)} onSave={handleSaveService} error={modalError} />}
    </div>
  );
}