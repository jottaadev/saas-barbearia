// src/app/painel/meus-horarios/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Sidebar } from '../../../components/painel/Sidebar';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns'; // Importamos a função format
import 'react-day-picker/dist/style.css';
import { Calendar as CalendarIcon, Clock, Lock, Unlock, AlertCircle, Loader2, Plane, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

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
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await axios.get(`${apiUrl}/api/barber/schedule?date=${formattedDate}`, {
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
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await axios.get(`${apiUrl}/api/barber/absences`, { headers: { 'Authorization': `Bearer ${token}` } });
            setAbsences(response.data);
        } catch (err) {
             setError('Não foi possível carregar suas ausências.');
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
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (action === 'block') {
                await axios.post(`${apiUrl}/api/barber/block-slot`, { slot_time: slot.time }, { headers: { 'Authorization': `Bearer ${token}` }});
                toast.success('Horário bloqueado!');
            } else {
                await axios.delete(`${apiUrl}/api/barber/unblock-slot`, { 
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        
        // --- A CORREÇÃO ESTÁ AQUI ---
        // Formatamos as datas para 'ano-mês-dia' ANTES de as enviar.
        const payload = {
            start_date: format(absenceRange.from, 'yyyy-MM-dd'),
            end_date: format(absenceRange.to || absenceRange.from, 'yyyy-MM-dd'), // Se não houver data final, usa a inicial
        };

        const promise = axios.post(`${apiUrl}/api/barber/absences`, payload, { headers: { 'Authorization': `Bearer ${token}` } });
        
        toast.promise(promise, {
            loading: 'A registar ausência...',
            success: () => {
                fetchAbsences(token);
                fetchDaySchedule(selectedDate, token); 
                setAbsenceRange({ from: undefined, to: undefined });
                return 'Ausência registada com sucesso!';
            },
            error: 'Não foi possível registar a ausência.'
        });
    };

    const handleDeleteAbsence = async (absenceId) => {
        if (!window.confirm("Tem a certeza que quer remover este período de ausência?")) return;
        const token = sessionStorage.getItem('authToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const promise = axios.delete(`${apiUrl}/api/barber/absences/${absenceId}`, { headers: { 'Authorization': `Bearer ${token}` }});

        toast.promise(promise, {
            loading: 'A remover ausência...',
            success: () => {
                fetchAbsences(token);
                fetchDaySchedule(selectedDate, token);
                return 'Ausência removida com sucesso!';
            },
            error: 'Não foi possível remover a ausência.'
        });
    };
    
    if (!user) {
        return <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-white">A verificar...</div>;
    }

    return (
        <>
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#27272a', color: '#fff', border: '1px solid #3f3f46' } }} />
            <div className="bg-zinc-950 min-h-screen text-white flex font-sans">
                <Sidebar user={user} />
                <main className="flex-1 p-8 space-y-8 overflow-y-auto">
                    <h1 className="font-display font-bold text-4xl text-white">Gerir Minha Disponibilidade</h1>

                    {/* Secção de Ausências */}
                    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                        <h2 className="font-display font-bold text-2xl text-white mb-4">Registar Período de Ausência (Férias)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                            <div className="md:col-span-2 flex justify-center md:justify-start">
                                <DayPicker mode="range" selected={absenceRange} onSelect={setAbsenceRange} locale={ptBR} fromDate={new Date()} className="text-white" />
                            </div>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <p className="text-sm text-zinc-400">Início: {absenceRange?.from ? format(absenceRange.from, 'dd/MM/yyyy') : 'Nenhum'}</p>
                                    <p className="text-sm text-zinc-400">Fim: {absenceRange?.to ? format(absenceRange.to, 'dd/MM/yyyy') : 'Nenhum'}</p>
                                </div>
                                <button onClick={handleAddAbsence} className="w-full flex items-center justify-center gap-2 bg-amber-500 text-zinc-950 font-bold py-3 px-4 rounded-lg hover:bg-amber-400 transition-colors">
                                    <Plane size={20} /> Registar Ausência
                                </button>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-zinc-800">
                            <h3 className="font-bold text-white mb-2">Períodos de Ausência Registados:</h3>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {isLoading.absences ? <p className="text-zinc-400">A carregar...</p> : absences.map(abs => (
                                    <div key={abs.id} className="flex justify-between items-center bg-zinc-800 p-3 rounded-md">
                                        <p>{format(new Date(abs.start_date), 'dd/MM/yyyy')} até {format(new Date(abs.end_date), 'dd/MM/yyyy')}</p>
                                        <button onClick={() => handleDeleteAbsence(abs.id)} className="p-1 text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                                {!isLoading.absences && absences.length === 0 && <p className="text-zinc-500">Nenhum período de ausência registado.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Secção da Agenda Diária */}
                    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                        <h2 className="font-display font-bold text-2xl text-white mb-4">
                            Gerir Horários de {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                        </h2>
                        {isLoading.schedule ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-amber-500" size={32}/></div> : 
                         error ? <div className="text-red-500 flex items-center gap-2"><AlertCircle size={16}/>{error}</div> : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {daySchedule.length > 0 ? daySchedule.map(slot => {
                                    const isAvailable = slot.status === 'Disponível';
                                    const isBlocked = slot.status === 'Bloqueado';
                                    const isBooked = slot.status === 'Agendado';
                                    const isProcessing = slot.status === 'processando';
                                    
                                    const slotClasses = isBooked ? 'bg-red-900/50 text-red-400 cursor-not-allowed' :
                                                                isBlocked ? 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600' :
                                                                isAvailable ? 'bg-green-900/50 text-green-400 hover:bg-green-800/50' :
                                                                'opacity-50';

                                    return (
                                        <button 
                                            key={slot.time}
                                            onClick={() => handleSlotClick(slot)}
                                            disabled={isBooked || isProcessing}
                                            className={`p-3 rounded-md flex flex-col items-center justify-center text-center transition-all ${slotClasses}`}
                                        >
                                            <p className="font-bold text-xl text-white">{new Date(slot.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                            <div className="flex items-center gap-1 text-xs mt-1">
                                                {isAvailable && <Unlock size={12}/>}
                                                {isBlocked && <Lock size={12}/>}
                                                {isBooked && <CalendarIcon size={12}/>}
                                                {isProcessing ? <Loader2 className="animate-spin" size={12}/> : slot.status}
                                            </div>
                                        </button>
                                    );
                                }) : <p className="text-zinc-500 text-center col-span-full py-10">Este é um dia de folga.</p>}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}