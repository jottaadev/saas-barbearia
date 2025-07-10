// src/app/painel/relatorios/page.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Sidebar } from '@/components/painel/Sidebar';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp, Users, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';

const ReportCard = ({ title, children, icon: Icon, isLoading }) => (
    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 h-full">
        <h2 className="font-display font-bold text-2xl text-white mb-6 flex items-center gap-3">
            <Icon className="text-amber-500" />
            {title}
        </h2>
        <div className="h-[350px]">
            {isLoading ? (
                 <div className="flex items-center justify-center h-full text-zinc-500">A carregar dados...</div>
            ) : children}
        </div>
    </div>
);

export default function RelatoriosPage() {
    const [user, setUser] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [history, setHistory] = useState([]);
    const [allBarbers, setAllBarbers] = useState([]);
    const [isLoading, setIsLoading] = useState({ reports: true, history: true });
    const [error, setError] = useState({ reports: '', history: '' });

    const [filters, setFilters] = useState({
        date: null,
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

        const fetchInitialData = async () => {
            setIsLoading(prev => ({...prev, reports: true}));
            try {
                const [performanceResponse, barbersResponse] = await Promise.all([
                    axios.get('https://backend-barber-5sbe.onrender.com/api/admin/reports/performance', { headers: { 'Authorization': `Bearer ${token}` } }),
                    axios.get('https://backend-barber-5sbe.onrender.com/api/users/profiles', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                setReportData(performanceResponse.data);
                setAllBarbers(barbersResponse.data);
            } catch (err) {
                setError(prev => ({...prev, reports: 'Não foi possível carregar os dados de desempenho.'}));
            } finally {
                setIsLoading(prev => ({...prev, reports: false}));
            }
        };
        fetchInitialData();
    }, [user]);
    
    useEffect(() => {
        if (!user) return;
        
        const fetchHistory = async () => {
            setIsLoading(prev => ({...prev, history: true}));
            setError(prev => ({ ...prev, history: '' }));
            const token = sessionStorage.getItem('authToken');
            try {
                const params = {
                    date: filters.date ? format(filters.date, 'yyyy-MM-dd') : '',
                    barberId: filters.barberId,
                    status: filters.status,
                };
                const response = await axios.get('https://backend-barber-5sbe.onrender.com/api/admin/appointments', { headers: { 'Authorization': `Bearer ${token}` }, params });
                setHistory(response.data);
            } catch (err) {
                setError(prev => ({...prev, history: 'Não foi possível carregar o histórico.'}));
            } finally {
                setIsLoading(prev => ({...prev, history: false}));
            }
        };
        fetchHistory();
    }, [user, filters]);

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
        setFilters(prev => ({ ...prev, date: date }));
        setIsCalendarOpen(false);
    };
    const clearFilters = () => setFilters({ date: null, barberId: '', status: '' });

    if (!user) {
        return <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-white">A verificar...</div>;
    }

    return (
        <div className="bg-zinc-950 min-h-screen text-white flex font-sans">
            <Sidebar user={user} />
            <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
                <h1 className="font-display font-bold text-4xl text-white mb-8">Relatórios de Desempenho</h1>
                
                {error.reports && <div className="bg-red-900/20 text-red-400 p-4 rounded-lg flex items-center gap-3 mb-6"><AlertCircle size={20}/> {error.reports}</div>}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ReportCard title="Faturação por Barbeiro" icon={TrendingUp} isLoading={isLoading.reports}>
                        <ResponsiveContainer>
                            <BarChart data={reportData?.barberPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis type="number" stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `R$${value}`} />
                                <YAxis type="category" dataKey="barber_name" stroke="#9ca3af" fontSize={12} width={80} />
                                <Tooltip cursor={{ fill: '#ffffff10' }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }} formatter={(value) => `R$ ${Number(value).toFixed(2)}`}/>
                                <Bar dataKey="total_revenue" name="Faturação" fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ReportCard>
                    
                    <ReportCard title="Atendimentos por Barbeiro" icon={Users} isLoading={isLoading.reports}>
                        <ResponsiveContainer>
                            <BarChart data={reportData?.barberPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis type="number" allowDecimals={false} stroke="#9ca3af" fontSize={12} />
                                <YAxis type="category" dataKey="barber_name" stroke="#9ca3af" fontSize={12} width={80} />
                                <Tooltip cursor={{ fill: '#ffffff10' }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}/>
                                <Bar dataKey="completed_appointments" name="Atendimentos" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ReportCard>
                </div>
                
                <div className="mt-8">
                    <h2 className="font-display font-bold text-3xl text-white mb-6">Histórico Completo</h2>
                    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-8 flex flex-col md:flex-row gap-4 items-end">
                        <div className="relative w-full md:w-auto" ref={calendarRef}>
                            <label className="text-xs font-bold text-zinc-400">Data</label>
                            <button onClick={() => setIsCalendarOpen(!isCalendarOpen)} className="w-full flex justify-between items-center p-2 bg-zinc-800 border border-zinc-700 rounded-md mt-1 cursor-pointer text-left">
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
                                <option value="">Todos</option>
                                {allBarbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="w-full md:w-auto">
                            <label className="text-xs font-bold text-zinc-400" htmlFor="status">Status</label>
                            <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md mt-1">
                                <option value="">Todos</option>
                                <option value="Pendente">Pendente</option>
                                <option value="Concluído">Concluído</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                        </div>
                        <div className="w-full md:w-auto">
                            <button onClick={clearFilters} className="w-full flex items-center justify-center gap-2 bg-zinc-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-zinc-600 transition-colors">
                                <RefreshCw size={16} /> Limpar
                            </button>
                        </div>
                    </div>

                    {error.history && <div className="bg-red-900/20 text-red-400 p-4 rounded-lg flex items-center gap-3"><AlertCircle size={20}/> {error.history}</div>}

                    <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
                        <table className="w-full text-left">
                            {/* ... (código da tabela) ... */}
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}