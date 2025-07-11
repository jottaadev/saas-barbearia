// src/app/painel/agenda-completa/page.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, AlertCircle, RefreshCw, BookOpen } from 'lucide-react';
import { Sidebar } from '@/components/painel/Sidebar';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { getStrapiURL } from '@/lib/utils';

export default function AgendaCompletaPage() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [allBarbers, setAllBarbers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    date: new Date(),
    barberId: '',
    status: '',
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (!token) { router.push('/painel/selecao-perfil'); return; }
    try {
      const decodedUser = jwtDecode(token);
      if (decodedUser.role !== 'admin') { router.push('/painel'); return; }
      setUser(decodedUser);
    } catch (error) {
      router.push('/painel/selecao-perfil');
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const token = sessionStorage.getItem('authToken');
    const fetchBarbers = async () => {
      try {
        const response = await axios.get(getStrapiURL('/api/users/profiles'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setAllBarbers(response.data.filter(p => p.role === 'barber'));
      } catch (err) {
        setError('Não foi possível carregar a lista de barbeiros.');
      }
    };
    fetchBarbers();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchAppointments = async () => {
      setIsLoading(true);
      setError('');
      try {
        const token = sessionStorage.getItem('authToken');
        const params = {
          date: filters.date ? format(filters.date, 'yyyy-MM-dd') : '',
          barberId: filters.barberId,
          status: filters.status,
        };
        const response = await axios.get(getStrapiURL('/api/admin/appointments'), {
          headers: { 'Authorization': `Bearer ${token}` },
          params: params,
        });
        setAppointments(response.data);
      } catch (err) {
        setError('Não foi possível carregar os agendamentos.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, [filters, user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [calendarRef]);

  const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleDateChange = (date) => {
    setFilters(prev => ({ ...prev, date: date || new Date() }));
    setIsCalendarOpen(false);
  };
  const clearFilters = () => setFilters({ date: new Date(), barberId: '', status: '' });
  
  if (!user) {
    return <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-white">A verificar permissões...</div>;
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-white flex font-sans">
      <Sidebar user={user} />
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display font-bold text-4xl text-white flex items-center gap-3">
            <BookOpen className="text-amber-500" />
            Agenda Completa
          </h1>
        </div>

        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-8 flex flex-col md:flex-row gap-4 items-end">
            <div className="relative w-full md:w-auto" ref={calendarRef}>
                <label className="text-xs font-bold text-zinc-400">Data</label>
                <button onClick={() => setIsCalendarOpen(!isCalendarOpen)} className="w-full md:w-48 flex justify-between items-center p-2 bg-zinc-800 border border-zinc-700 rounded-md mt-1 cursor-pointer text-left">
                  <span>{filters.date ? format(filters.date, 'dd/MM/yyyy') : 'Qualquer data'}</span>
                  <CalendarIcon size={16} className="text-zinc-400"/>
                </button>
                {isCalendarOpen && (
                  <div className="absolute top-full mt-2 z-10 bg-zinc-800 rounded-md border border-zinc-700 shadow-lg">
                    <DayPicker mode="single" selected={filters.date} onSelect={handleDateChange} locale={ptBR} />
                  </div>
                )}
            </div>
             <div className="w-full md:w-auto">
                <label className="text-xs font-bold text-zinc-400" htmlFor="barberId">Barbeiro</label>
                <select id="barberId" name="barberId" value={filters.barberId} onChange={handleFilterChange} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md mt-1">
                    <option value="">Todos os Barbeiros</option>
                    {allBarbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
            </div>
             <div className="w-full md:w-auto">
                <label className="text-xs font-bold text-zinc-400" htmlFor="status">Status</label>
                <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md mt-1">
                    <option value="">Todos os Status</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Cancelado">Cancelado</option>
                </select>
            </div>
            <div className="w-full md:w-auto">
                <button onClick={clearFilters} className="w-full flex items-center justify-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-zinc-600 transition-colors">
                    <RefreshCw size={16} />
                    Limpar
                </button>
            </div>
        </div>

        {error && <div className="bg-red-900/20 text-red-400 p-4 rounded-lg flex items-center gap-3"><AlertCircle size={20}/> {error}</div>}

        <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
          <div className="max-h-[65vh] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-800 sticky top-0">
                <tr>
                  <th className="p-4 font-bold text-sm text-zinc-400 uppercase">Cliente</th>
                  <th className="p-4 font-bold text-sm text-zinc-400 uppercase">Serviço</th>
                  <th className="p-4 font-bold text-sm text-zinc-400 uppercase">Barbeiro</th>
                  <th className="p-4 font-bold text-sm text-zinc-400 uppercase">Horário</th>
                  <th className="p-4 font-bold text-sm text-zinc-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                    <tr><td colSpan="5" className="p-4 text-center text-zinc-500">A carregar agendamentos...</td></tr>
                ) : appointments.length > 0 ? appointments.map(app => (
                  <tr key={app.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                    <td className="p-4 font-medium text-white">{app.client_name}</td>
                    <td className="p-4 text-zinc-300">{app.service_name}</td>
                    <td className="p-4 text-zinc-300">{app.barber_name}</td>
                    <td className="p-4 text-zinc-300">{new Date(app.appointment_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          app.status === 'Concluído' ? 'bg-green-500/20 text-green-400' :
                          app.status === 'Cancelado' ? 'bg-red-500/20 text-red-400' :
                          'bg-blue-500/20 text-blue-400'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="p-8 text-center text-zinc-500">Nenhum agendamento encontrado para os filtros selecionados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
