// src/app/painel/meus-horarios/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Sidebar } from '../../../components/painel/Sidebar';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { Calendar, Clock, Lock, Unlock, AlertCircle, Loader2, Plane, Trash2 } from 'lucide-react';
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
            const response = await axios.get(`https://backend-barber-5sbe.onrender.com/api/barber/schedule?date=${formattedDate}`, {
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
            const response = await axios.get('https://backend-barber-5sbe.onrender.com/api/barber/absences', { headers: { 'Authorization': `Bearer ${token}` } });
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

    const handleSlotClick = async (slot) => { /* ... (código sem alterações) ... */ };

    const handleAddAbsence = async () => {
        if (!absenceRange.from || !absenceRange.to) {
            toast.error("Por favor, selecione um período de início e fim.");
            return;
        }
        const token = sessionStorage.getItem('authToken');
        const promise = axios.post('http://localhost:3333/api/barber/absences', {
            start_date: format(absenceRange.from, 'yyyy-MM-dd'),
            end_date: format(absenceRange.to, 'yyyy-MM-dd'),
        }, { headers: { 'Authorization': `Bearer ${token}` } });
        
        toast.promise(promise, {
            loading: 'A registar ausência...',
            success: () => {
                fetchAbsences(token);
                setAbsenceRange({ from: undefined, to: undefined });
                return 'Ausência registada com sucesso!';
            },
            error: 'Não foi possível registar a ausência.'
        });
    };

    const handleDeleteAbsence = async (absenceId) => {
        if (!window.confirm("Tem a certeza que quer remover este período de ausência?")) return;
        const token = sessionStorage.getItem('authToken');
        const promise = axios.delete(`http://localhost:3333/api/barber/absences/${absenceId}`, { headers: { 'Authorization': `Bearer ${token}` }});

        toast.promise(promise, {
            loading: 'A remover ausência...',
            success: () => {
                fetchAbsences(token);
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
                <main className="flex-1 p-8 space-y-8">
                    <h1 className="font-display font-bold text-4xl text-white">Gerir Minha Disponibilidade</h1>

                    {/* Secção de Ausências */}
                    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                        <h2 className="font-display font-bold text-2xl text-white mb-4">Registar Período de Ausência</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Selecione o período (início e fim):</label>
                                <DayPicker mode="range" selected={absenceRange} onSelect={setAbsenceRange} locale={ptBR} fromDate={new Date()} />
                            </div>
                            <button onClick={handleAddAbsence} className="w-full flex items-center justify-center gap-2 bg-amber-500 text-zinc-950 font-bold py-3 px-4 rounded-lg hover:bg-amber-400 transition-colors">
                                <Plane size={20} /> Registar Ausência
                            </button>
                        </div>
                        <div className="mt-6 pt-4 border-t border-zinc-800">
                            <h3 className="font-bold text-white mb-2">Períodos Registados:</h3>
                            <div className="space-y-2">
                                {absences.map(abs => (
                                    <div key={abs.id} className="flex justify-between items-center bg-zinc-800 p-2 rounded-md">
                                        <p>{format(new Date(abs.start_date), 'dd/MM/yy')} até {format(new Date(abs.end_date), 'dd/MM/yy')}</p>
                                        <button onClick={() => handleDeleteAbsence(abs.id)} className="p-1 text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Secção da Agenda Diária */}
                    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                        <h2 className="font-display font-bold text-2xl text-white mb-4">
                            Agenda de {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                        </h2>
                        {isLoading.schedule ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-amber-500" size={32}/></div> : 
                         error && !daySchedule.length ? <div className="text-red-500 flex items-center gap-2"><AlertCircle size={16}/>{error}</div> : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {daySchedule.length > 0 ? daySchedule.map(slot => {
                                    // ... (o JSX do slot continua o mesmo) ...
                                }) : <p className="text-zinc-500 text-center col-span-full py-10">Este é um dia de folga.</p>}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}