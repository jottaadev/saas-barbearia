// src/app/painel/equipa/page.js
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/painel/Sidebar';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { getStrapiURL } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// --- Componente Modal para Adicionar/Editar Membro ---
const BarberModal = ({ barber, onClose, onSave, error, isSaving }) => {
  const [formData, setFormData] = useState({
    name: barber?.name || '',
    username: barber?.username || '',
    role: barber?.role || 'barber',
    avatar_url: barber?.avatar_url || '',
    password: '',
    is_featured: barber?.is_featured || false,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
        if (key === 'password' && barber && !formData.password) return;
        data.append(key, formData[key]);
    });
    if (avatarFile) {
      data.append('avatar', avatarFile);
    }
    onSave(data, !!barber);
  };

  const previewUrl = avatarFile ? URL.createObjectURL(avatarFile) : getStrapiURL(formData.avatar_url);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-lg w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display font-bold text-2xl text-white mb-6">{barber ? 'Editar Membro' : 'Adicionar Membro'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-zinc-700">
              {previewUrl ? <img src={previewUrl} alt="Preview" className="object-cover w-full h-full"/> : <ImageIcon className="text-zinc-600" size={40}/>}
            </div>
            <button type="button" onClick={() => fileInputRef.current.click()} className="flex-1 p-3 bg-zinc-700 rounded-lg text-center font-bold hover:bg-zinc-600 transition-colors">Escolher Foto</button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
          </div>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nome Completo" required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg"/>
          <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Nome de Utilizador" required className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg"/>
          <select name="role" value={formData.role} onChange={handleChange} className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg"><option value="barber">Barbeiro</option><option value="admin">Administrador</option></select>
          {formData.role === 'admin' && (
            <div className="animate-fade-in">
              <label className="text-sm font-medium text-zinc-400" htmlFor="password">Senha</label>
              <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder={barber ? 'Deixe em branco para não alterar' : 'Senha para o admin'} required={!barber} className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg mt-1" />
            </div>
          )}
          <div className="flex items-center gap-3 pt-2">
            <input id="is_featured" name="is_featured" type="checkbox" checked={formData.is_featured} onChange={handleChange} className="h-4 w-4 rounded border-zinc-600 text-amber-500 focus:ring-amber-500 bg-zinc-700"/>
            <label htmlFor="is_featured" className="text-sm font-medium text-zinc-300">Destacar na página inicial?</label>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-6 rounded-lg bg-zinc-700 hover:bg-zinc-600 font-bold">Cancelar</button>
            <button type="submit" disabled={isSaving} className="py-2 px-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold flex items-center gap-2 disabled:bg-zinc-600">
                {isSaving ? <><Loader2 className="animate-spin" size={16}/> A guardar...</> : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Componente Modal de Confirmação para Apagar ---
const ConfirmationModal = ({ onConfirm, onCancel, isDeleting }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-lg w-full max-w-sm text-center">
            <h2 className="font-display font-bold text-xl text-white mb-2">Tem a certeza?</h2>
            <p className="font-sans text-zinc-400 mb-6">Esta ação não pode ser desfeita. O membro será permanentemente apagado.</p>
            <div className="flex gap-4">
                <button onClick={onCancel} className="w-full py-3 rounded-lg bg-zinc-700 hover:bg-zinc-600 font-bold">Cancelar</button>
                <button onClick={onConfirm} disabled={isDeleting} className="w-full py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 flex items-center justify-center gap-2 disabled:bg-red-800">
                    {isDeleting ? <><Loader2 className="animate-spin" size={16}/> A apagar...</> : 'Sim, apagar'}
                </button>
            </div>
        </div>
    </div>
);

// --- Componente Principal da Página ---
export default function GerirEquipaPage() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [deletingBarberId, setDeletingBarberId] = useState(null);
  const router = useRouter();

  const fetchTeam = useCallback(async (token) => {
    setIsLoading(true);
    try {
      const response = await axios.get(getStrapiURL('/api/users/profiles'), { headers: { 'Authorization': `Bearer ${token}` } });
      setTeam(response.data);
    } catch (err) {
      setError('Não foi possível carregar a equipa.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (!token) { router.push('/painel/selecao-perfil'); return; }
    try {
      const decodedUser = jwtDecode(token);
      if (decodedUser.role !== 'admin') { router.push('/painel'); return; }
      setUser(decodedUser);
      fetchTeam(token);
    } catch (error) { router.push('/painel/selecao-perfil'); }
  }, [router, fetchTeam]);

  const handleSaveBarber = async (formData, isEditing) => {
    setIsSaving(true);
    setModalError('');
    const token = sessionStorage.getItem('authToken');
    const config = { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
    const url = isEditing ? getStrapiURL(`/api/users/${editingBarber.id}`) : getStrapiURL('/api/users');
    const method = isEditing ? 'put' : 'post';
    try {
      await axios[method](url, formData, config);
      setIsModalOpen(false);
      setEditingBarber(null);
      fetchTeam(token);
    } catch (err) {
      setModalError(err.response?.data?.error || 'Não foi possível guardar.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBarber = async () => {
    setIsDeleting(true);
    setError('');
    const token = sessionStorage.getItem('authToken');
    try {
      await axios.delete(getStrapiURL(`/api/users/${deletingBarberId}`), { headers: { 'Authorization': `Bearer ${token}` } });
      fetchTeam(token);
      setDeletingBarberId(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível apagar.');
    } finally {
        setIsDeleting(false);
    }
  };
  
  const handleOpenModal = (barber = null) => {
    setEditingBarber(barber);
    setIsModalOpen(true);
    setModalError('');
  };

  const handleOpenDeleteConfirmation = (barberId) => {
      setDeletingBarberId(barberId);
  }

  if (!user) {
    return <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-white">A verificar...</div>;
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-white flex font-sans">
      <Sidebar user={user} />
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display font-bold text-4xl text-white">Gerir Equipa</h1>
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-amber-500 text-zinc-950 font-bold py-2 px-4 rounded-lg hover:bg-amber-400 transition-colors"><Plus size={20} />Adicionar Membro</button>
        </div>
        {isLoading && <p>A carregar equipa...</p>}
        {error && <div className="bg-red-900/20 text-red-400 p-4 rounded-lg flex items-center gap-3"><AlertCircle size={20}/> {error}</div>}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-800">
              <tr>
                <th className="p-4 font-bold text-sm text-zinc-400 uppercase">Nome</th>
                <th className="p-4 font-bold text-sm text-zinc-400 uppercase">Utilizador</th>
                <th className="p-4 font-bold text-sm text-zinc-400 uppercase">Função</th>
                <th className="p-4 font-bold text-sm text-zinc-400 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {team.map(barber => (
                <tr key={barber.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                  <td className="p-4 font-medium text-white flex items-center gap-3">
                    <img src={getStrapiURL(barber.avatar_url) || '/default-avatar.png'} alt={barber.name} className="rounded-full object-cover w-10 h-10"/>
                    {barber.name}
                  </td>
                  <td className="p-4 text-zinc-300">{barber.username}</td>
                  <td className="p-4"><span className={`px-2 py-1 text-xs font-bold rounded-full ${barber.role === 'admin' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{barber.role === 'admin' ? 'Admin' : 'Barbeiro'}</span></td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(barber)} className="px-3 py-1 text-sm font-bold text-blue-400 hover:bg-blue-900/50 rounded-md">Editar</button>
                    <button onClick={() => handleOpenDeleteConfirmation(barber.id)} className="px-3 py-1 text-sm font-bold text-red-500 hover:bg-red-900/50 rounded-md">Apagar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      {isModalOpen && <BarberModal barber={editingBarber} onClose={() => setIsModalOpen(false)} onSave={handleSaveBarber} error={modalError} isSaving={isSaving}/>}
      {deletingBarberId && <ConfirmationModal onConfirm={handleDeleteBarber} onCancel={() => setDeletingBarberId(null)} isDeleting={isDeleting}/>}
    </div>
  );
}
