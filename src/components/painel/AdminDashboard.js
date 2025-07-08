// src/components/painel/AdminDashboard.js
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Users, TrendingUp, AlertCircle, CalendarClock, Scissors } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const StatCard = ({ title, value, detail, icon: Icon, colorClass }) => (
  <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 flex items-center gap-6">
    <div className={`p-4 rounded-lg ${colorClass}`}><Icon className="text-white" size={28}/></div>
    <div>
      <h3 className="font-sans text-zinc-400 text-sm">{title}</h3>
      <p className="font-display text-3xl font-bold text-white">{value}</p>
      {detail && <p className="font-sans text-xs text-zinc-500">{detail}</p>}
    </div>
  </div>
);

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('7days');
  const [isLoading, setIsLoading] = useState({ stats: true, chart: true });
  const [error, setError] = useState({ stats: '', chart: '' });

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const fetchStats = async () => {
      setIsLoading(prev => ({ ...prev, stats: true }));
      try {
        const response = await axios.get(`${apiUrl}/api/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } });
        setStats(response.data);
        setError(prev => ({ ...prev, stats: '' }));
      } catch (err) {
        setError(prev => ({ ...prev, stats: 'Não foi possível carregar as estatísticas.' }));
      } finally {
        setIsLoading(prev => ({ ...prev, stats: false }));
      }
    };

    const fetchChartData = async () => {
      setIsLoading(prev => ({ ...prev, chart: true }));
      try {
        const response = await axios.get(`${apiUrl}/api/admin/charts/revenue?period=${chartPeriod}`, { headers: { 'Authorization': `Bearer ${token}` } });
        setChartData(response.data);
        setError(prev => ({ ...prev, chart: '' }));
      } catch (err) {
        setError(prev => ({ ...prev, chart: 'Não foi possível carregar os dados do gráfico.' }));
      } finally {
        setIsLoading(prev => ({ ...prev, chart: false }));
      }
    };

    fetchStats();
    fetchChartData();
  }, [chartPeriod]);

  return (
    <div className="animate-fade-in space-y-8">
        <h1 className="font-display font-bold text-4xl text-white">Dashboard Geral</h1>
        
        {error.stats && <div className="bg-red-900/20 text-red-400 p-4 rounded-lg flex items-center gap-3"><AlertCircle size={20}/> {error.stats}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Faturação (Este Mês)" value={isLoading.stats ? '...' : `R$ ${stats?.revenueThisMonth || '0.00'}`} detail="Serviços concluídos" icon={DollarSign} colorClass="bg-green-500/20" />
            <StatCard title="Atendimentos Concluídos" value={isLoading.stats ? '...' : stats?.appointmentsDoneThisMonth || 0} detail="Total neste mês" icon={Users} colorClass="bg-blue-500/20" />
            <StatCard title="Agendamentos Pendentes" value={isLoading.stats ? '...' : stats?.pendingAppointmentsThisMonth || 0} detail="Para o resto do mês" icon={CalendarClock} colorClass="bg-amber-500/20" />
        </div>
        
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
                    <TrendingUp className="text-amber-500"/>
                    Evolução da Faturação
                </h2>
                <div className="flex items-center gap-2 bg-zinc-800 p-1 rounded-md">
                    <button onClick={() => setChartPeriod('7days')} className={`px-3 py-1 text-sm font-medium rounded ${chartPeriod === '7days' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:bg-zinc-700'}`}>Últimos 7 dias</button>
                    <button onClick={() => setChartPeriod('thisWeek')} className={`px-3 py-1 text-sm font-medium rounded ${chartPeriod === 'thisWeek' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:bg-zinc-700'}`}>Esta Semana</button>
                    <button onClick={() => setChartPeriod('thisMonth')} className={`px-3 py-1 text-sm font-medium rounded ${chartPeriod === 'thisMonth' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:bg-zinc-700'}`}>Este Mês</button>
                </div>
             </div>
             
             {error.chart && <div className="bg-red-900/20 text-red-400 p-4 rounded-lg flex items-center gap-3"><AlertCircle size={20}/> {error.chart}</div>}
             
             {isLoading.chart ? <div className="h-[300px] flex items-center justify-center text-zinc-400">A carregar gráfico...</div> : (
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `R$${value}`} />
                            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }} formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, "Faturação"]}/>
                            <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
             )}
        </div>
    </div>
  );
}