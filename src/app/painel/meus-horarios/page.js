// src/app/painel/meus-horarios/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Sidebar } from '@/components/painel/Sidebar';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { Calendar as CalendarIcon, Lock, Unlock, AlertCircle, Loader2, Plane, Trash2, Bed, Briefcase } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { getStrapiURL } from '@/lib/utils';

export default function MeusHorariosPage() {
    const [user, setUser] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [daySchedule, setDaySchedule] = useState([]);
    const [absences, setAbsences] = useState([]);
    const [isLoading, setIsLoading] = useState({ schedule: true, absences: true });
    const [error, setError] = useState('');
    const [absenceRange, setAbsenceRange] = useState({ from: undefined, to: undefined });
    const router = useRouter();

    const fetchDaySchedule = useCallback(async (date, token) => {
        setIsLoading(prev => ({...prev, schedule: true}));
        setError('');
        try {
            const formattedDate = format(date, 'yyyy-MM-dd');
            const response = await axios.get(getStrapiURL(`/api/barber/schedule?date=${formattedDate}`), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setDaySchedule(response.data);
        } catch (err) {
            setError('Não foi possível carregar a agenda para este dia.');
        } finally {
            setIsLoading(prev => ({...prev, schedule: false}));
        }
    }, []);
    
    const fetchAbsences = useCallback(async (token) => {
        setIsLoading(prev => ({...prev, absences: true}));
        try {
            const response = await axios.get(getStrapiURL(`/api/barber/absences`), { headers: { 'Authorization': `Bearer ${token}` } });
            setAbsences(response.data);
        } catch (err) {
             setError('Não foi possível carregar as suas ausências.');
        } finally {
             setIsLoading(prev => ({...prev, absences: false}));
        }
    }, []);

    useEffect(() => {
        const token = sessionStorage.getItem('authToken');
        if (!token) { router.push('/painel/selecao-perfil'); return; }
        try {
            const decodedUser = jwtDecode(token);
            setUser(decodedUser);
            fetchAbsences(token);
        } catch (error) {
            router.push('/painel/selecao-perfil');
        }
    }, [router, fetchAbsences]);
    
    useEffect(() => {
        if (user) {
            fetchDaySchedule(selectedDate, sessionStorage.getItem('authToken'));
        }
    }, [user, selectedDate, fetchDaySchedule]);

    const handleSlotClick = async (slot) => {
        const token = sessionStorage.getItem('authToken');
        const action = slot.status === 'Disponível' ? 'block' : (slot.status === 'Bloqueado' ? 'unblock' : null);
        if (!action) return;

        const originalSchedule = [...daySchedule];
        setDaySchedule(currentSchedule => currentSchedule.map(s => s.time === slot.time ? {...s, status: 'processando'} : s));
        
        try {
            if (action === 'block') {
                await axios.post(getStrapiURL('/api/barber/block-slot'), { slot_time: slot.time }, { headers: { 'Authorization': `Bearer ${token}` }});
                toast.success('Horário bloqueado!');
            } else {
                await axios.delete(getStrapiURL('/api/barber/unblock-slot'), { 
                    headers: { 'Authorization': `Bearer ${token}` },
                    data: { slot_time: slot.time }
                });
                toast.success('Horário desbloqueado!');
            }
            fetchDaySchedule(selectedDate, token);
        } catch (err) {
            toast.error('Ocorreu um erro.');
            setDaySchedule(originalSchedule);
        }
    };

    const handleAddAbsence = async () => {
        if (!absenceRange?.from) {
            toast.error("Por favor, selecione pelo menos um dia de início.");
            return;
        }
        const token = sessionStorage.getItem('authToken');
        
        const payload = {
            start_date: format(absenceRange.from, 'yyyy-MM-dd'),
            end_date: format(absenceRange.to || absenceRange.from, 'yyyy-MM-dd'),
        };

        const promise = axios.post(getStrapiURL('/api/barber/absences'), payload, { headers: { 'Authorization': `Bearer ${token}` } });
        
        toast.promise(promise, {
            loading: 'A registar ausência...',
            success: () => {
                fetchAbsences(token);
                setAbsenceRange({ from: undefined, to: undefined });
                return 'Ausência registada com sucesso!';
            },
            error: (err) => err.response?.data?.error || 'Não foi possível registar a ausência.'
        });
    };

    const handleDeleteAbsence = async (absenceId) => {
        if (!window.confirm("Tem a certeza que quer remover este período de ausência?")) return;
        const token = sessionStorage.getItem('authToken');
        const promise = axios.delete(getStrapiURL(`/api/barber/absences/${absenceId}`), { headers: { 'Authorization': `Bearer ${token}` }});

        toast.promise(promise, {
            loading: 'A remover ausência...',
            success: () => {
                fetchAbsences(token);
                return 'Ausência removida com sucesso!';
            },
            error: (err) => err.response?.data?.error || 'Não foi possível remover a ausência.'
        });
    };
    
    if (!user) {
        return <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-white">A verificar...</div>;
    }

    return (
        <div className="bg-zinc-950 min-h-screen text-white flex font-sans">
            <Sidebar user={user} />
            <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
                <Toaster position="bottom-right" toastOptions={{ style: { background: '#27272a', color: '#fff', border: '1px solid #3f3f46' } }} />
                <h1 className="font-display font-bold text-4xl text-white">Gerir Disponibilidade</h1>

                <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                    <h2 className="font-display font-bold text-2xl text-white mb-4 flex items-center gap-2"><Plane size={24} className="text-amber-500"/> Registar Ausências (Férias)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                        <div className="lg:col-span-2 flex justify-center bg-zinc-950/50 p-2 rounded-md border border-zinc-800">
                            <DayPicker mode="range" selected={absenceRange} onSelect={setAbsenceRange} locale={ptBR} fromDate={new Date()} />
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="bg-zinc-800 p-4 rounded-md">
                                <p className="text-sm font-bold text-zinc-300">Período Selecionado:</p>
                                <p className="text-sm text-amber-400">Início: {absenceRange?.from ? format(absenceRange.from, 'dd/MM/yyyy') : 'Nenhum'}</p>
                                <p className="text-sm text-amber-400">Fim: {absenceRange?.to ? format(absenceRange.to, 'dd/MM/yyyy') : 'Nenhum'}</p>
                            </div>
                            <button onClick={handleAddAbsence} disabled={!absenceRange?.from} className="w-full flex items-center justify-center gap-2 bg-amber-500 text-zinc-950 font-bold py-3 px-4 rounded-lg hover:bg-amber-400 transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed">
                                <Plane size={20} /> Registar Ausência
                            </button>
                            <div className="mt-4 pt-4 border-t border-zinc-700">
                                <h3 className="font-bold text-white mb-2">Períodos Registados:</h3>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                    {isLoading.absences ? <p className="text-zinc-400 text-sm">A carregar...</p> : absences.length > 0 ? absences.map(abs => (
                                        <div key={abs.id} className="flex justify-between items-center bg-zinc-800 p-3 rounded-md text-sm">
                                            <p>{format(new Date(abs.start_date), 'dd/MM/yy')} - {format(new Date(abs.end_date), 'dd/MM/yy')}</p>
                                            <button onClick={() => handleDeleteAbsence(abs.id)} className="p-1 text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                                        </div>
                                    )) : <p className="text-zinc-500 text-sm">Nenhuma ausência registada.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                    <h2 className="font-display font-bold text-2xl text-white mb-4 flex items-center gap-2">
                        <Briefcase size={24} className="text-amber-500"/> Agenda de {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                    </h2>
                    {isLoading.schedule ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-amber-500" size={32}/></div> : 
                     error ? <div className="text-red-500 flex items-center justify-center py-10 gap-2"><AlertCircle size={16}/>{error}</div> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {daySchedule.length > 0 ? daySchedule.map(slot => {
                                const isAvailable = slot.status === 'Disponível';
                                const isBlocked = slot.status === 'Bloqueado';
                                const isBooked = slot.status === 'Agendado';
                                const isProcessing = slot.status === 'processando';
                                
                                const slotClasses = 
                                    isBooked ? 'bg-red-900/50 border-red-800 text-red-400 cursor-not-allowed' :
                                    isBlocked ? 'bg-zinc-700 border-zinc-600 text-zinc-400 hover:bg-zinc-600' :
                                    isAvailable ? 'bg-green-900/50 border-green-800 text-green-400 hover:bg-green-800/50' :
                                    'opacity-50';

                                return (
                                    <button 
                                        key={slot.time}
                                        onClick={() => handleSlotClick(slot)}
                                        disabled={isBooked || isProcessing}
                                        className={`p-3 rounded-md flex flex-col items-center justify-center text-center transition-all border ${slotClasses}`}
                                    >
                                        <p className="font-bold text-xl text-white">{new Date(slot.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                        <div className="flex items-center gap-1.5 text-xs mt-1">
                                            {isProcessing ? <Loader2 className="animate-spin" size={12}/> : 
                                             isAvailable ? <Unlock size={12}/> :
                                             isBlocked ? <Lock size={12}/> :
                                             <CalendarIcon size={12}/>}
                                            {isProcessing ? '...' : slot.status}
                                        </div>
                                    </button>
                                );
                            }) : (
                                <div className="col-span-full text-center py-16 bg-zinc-950/50 rounded-md">
                                    <Bed size={40} className="mx-auto text-zinc-600" />
                                    <p className="mt-2 font-bold text-zinc-400">Este é um dia de folga ou ausência.</p>
                                    <p className="text-sm text-zinc-500">Nenhum horário de trabalho configurado para esta data.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
