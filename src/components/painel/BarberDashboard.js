// src/components/painel/BarberDashboard.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Calendar, User, Clock, AlertCircle, CheckCircle, XCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast'; // Importa a função toast

export function BarberDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Novo estado para a pesquisa

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        setError('Autenticação necessária.');
        setIsLoading(false); 
        return;
      }
      const response = await axios.get('http://localhost:3333/api/barber/my-appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAppointments(response.data);
    } catch (err) {
      setError('Não foi possível carregar os seus agendamentos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    const originalAppointments = [...appointments];
    setAppointments(currentAppointments => currentAppointments.filter(app => app.id !== appointmentId));

    try {
      const token = sessionStorage.getItem('authToken');
      await axios.put(`http://localhost:3333/api/appointments/${appointmentId}/status`, 
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      // Notificação de sucesso
      toast.success(`Agendamento ${newStatus.toLowerCase()} com sucesso!`);
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      setAppointments(originalAppointments);
      // Notificação de erro
      toast.error("Não foi possível atualizar o status.");
    }
  };
  
  // Lógica de filtro: filtra a lista de agendamentos com base no termo de pesquisa
  const filteredAppointments = useMemo(() => {
    if (!searchTerm) return appointments;
    return appointments.filter(app => 
      app.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.service_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, appointments]);

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(date).replace(/^\w/, c => c.toUpperCase());
  };

  if (isLoading) {
    return <div className="text-center py-20"><p className="font-sans text-zinc-400">A carregar a sua agenda...</p></div>;
  }
  
  if (error) {
    return <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg flex items-center gap-3"><AlertCircle size={20}/> {error}</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <h1 className="font-display font-bold text-4xl text-white">Minha Agenda</h1>
        {/* --- BARRA DE PESQUISA --- */}
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20}/>
          <input 
            type="text"
            placeholder="Pesquisar por cliente ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 bg-zinc-900 border border-zinc-800 rounded-lg p-2 pl-10 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>
      
      {appointments.length > 0 && filteredAppointments.length === 0 && (
          <div className="text-center py-20 bg-zinc-900 rounded-lg border border-dashed border-zinc-800">
             <p className="font-sans text-zinc-500">Nenhum agendamento encontrado para a sua pesquisa.</p>
          </div>
      )}

      {appointments.length === 0 && !isLoading && (
        <div className="text-center py-24 bg-zinc-900 rounded-lg border border-dashed border-zinc-800">
          <Calendar size={48} className="mx-auto text-zinc-700" />
          <p className="font-display font-bold text-xl text-zinc-400 mt-4">Nenhum agendamento futuro.</p>
          <p className="font-sans text-zinc-500 text-sm mt-1">A sua agenda está livre. Aproveite!</p>
        </div>
      )}

      <div className="space-y-5">
        {filteredAppointments.map(app => (
          <div key={app.id} className="bg-zinc-900 p-5 rounded-lg border border-zinc-800 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                      <div className="text-center w-20">
                          <p className="font-display text-3xl font-bold text-white">{new Date(app.appointment_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="font-sans text-xs text-zinc-500">{new Date(app.appointment_time).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="h-12 border-l border-zinc-700"></div>
                      <div className="flex-1">
                          <p className="font-display font-bold text-lg text-white">{app.client_name}</p>
                          <p className="font-sans text-sm text-amber-400">{app.service_name}</p>
                      </div>
                  </div>
              </div>
              <div className="mt-2 pt-4 border-t border-zinc-800 flex justify-end gap-3">
                  <button onClick={() => handleUpdateStatus(app.id, 'Cancelado')} className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-400 transition-colors py-2 px-4 rounded-md hover:bg-red-500/10">
                      <XCircle size={16} /> Cancelar
                  </button>
                  <button onClick={() => handleUpdateStatus(app.id, 'Concluído')} className="flex items-center gap-2 text-sm font-bold text-green-500 hover:text-green-400 transition-colors bg-green-500/10 py-2 px-4 rounded-md hover:bg-green-500/20">
                      <CheckCircle size={16} /> Concluir Atendimento
                  </button>
              </div>
          </div>
        ))}
      </div>
    </div>
  );
}