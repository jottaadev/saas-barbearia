// src/app/agendamento/page.js
'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Loader, User, Users, XCircle } from 'lucide-react';
import Link from 'next/link';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { getStrapiURL } from '@/lib/utils';


function AgendamentoComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Estados ---
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const [isLoading, setIsLoading] = useState({ services: true, barbers: true, slots: false });
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    service: null,
    barber: null,
    date: new Date(),
    time: null,
    clientName: '',
    clientPhone: ''
  });

  // --- Funções de Atualização e Busca ---
  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const fetchInitialData = useCallback(async () => {
    try {
      const [servicesResponse, profilesResponse] = await Promise.all([
        axios.get(getStrapiURL('/api/services')),
        axios.get(getStrapiURL('/api/users/profiles'))
      ]);
      const allServices = servicesResponse.data;
      setServices(allServices);
      setBarbers(profilesResponse.data.filter(profile => profile.role === 'barber'));

      const serviceIdFromUrl = searchParams.get('servico');
      if (serviceIdFromUrl) {
        const selectedService = allServices.find(s => s.id === parseInt(serviceIdFromUrl));
        if (selectedService) updateFormData({ service: selectedService });
      }
    } catch (err) {
      toast.error('Não foi possível carregar os dados. Tente novamente.');
    } finally {
      setIsLoading(prev => ({ ...prev, services: false, barbers: false }));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (formData.barber && formData.date) {
      const fetchAvailability = async () => {
        setIsLoading(prev => ({...prev, slots: true}));
        setAvailableSlots([]);
        updateFormData({ time: null }); // Reseta o horário ao buscar novos
        try {
          const formattedDate = format(formData.date, 'yyyy-MM-dd');
          const response = await axios.get(getStrapiURL('/api/public/availability'), {
            params: { barberId: formData.barber.id, date: formattedDate }
          });
          setAvailableSlots(response.data);
        } catch (err) {
          toast.error("Erro ao buscar horários para este dia.");
        } finally {
          setIsLoading(prev => ({...prev, slots: false}));
        }
      };
      fetchAvailability();
    }
  }, [formData.barber, formData.date]);


  // --- Submissão do Formulário ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.clientPhone) {
        toast.error("Preencha seu nome e telefone.");
        return;
    }

    setIsLoading(prev => ({...prev, submit: true}));
    
    try {
      const date = new Date(formData.date);
      const [hours, minutes] = formData.time.split(':');
      date.setHours(hours); date.setMinutes(minutes);

      const appointmentData = {
        serviceId: formData.service.id,
        barberId: formData.barber.id,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        appointmentTime: date.toISOString(),
      };

      await axios.post(getStrapiURL('/api/appointments'), appointmentData);
      
      const params = new URLSearchParams({
        servico: formData.service.name,
        barbeiro: formData.barber.name,
        data: formData.date.toISOString().split('T')[0],
        hora: formData.time,
      });
      router.push(`/agendamento/confirmado?${params.toString()}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Não foi possível agendar.');
    } finally {
        setIsLoading(prev => ({...prev, submit: false}));
    }
  };

  const isSelectionComplete = formData.service && formData.barber && formData.date && formData.time;

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#27272a', color: '#fff', border: '1px solid #3f3f46' } }} />
      <div className="bg-black min-h-screen text-white font-sans flex flex-col p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl mx-auto">
            <header className="mb-8">
                <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition-colors">
                    <ArrowLeft size={18} />
                    Voltar para a página inicial
                </Link>
                <h1 className="font-display text-4xl font-bold mt-4 text-white">Faça seu Agendamento</h1>
                <p className="text-zinc-400">Escolha o serviço, profissional e o melhor horário para si.</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Coluna da Esquerda: Seleções */}
              <div className="lg:col-span-3 space-y-8">
                  {/* Seleção de Serviço */}
                  <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800">
                      <h2 className="font-display text-xl font-bold text-amber-400 mb-4">1. Escolha o Serviço</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {isLoading.services ? <p>A carregar...</p> : services.map(s => (
                            <button key={s.id} onClick={() => updateFormData({ service: s })}
                                className={`p-3 border-2 rounded-lg text-left transition-all ${formData.service?.id === s.id ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800 hover:bg-zinc-900'}`}>
                                <p className="font-bold text-white">{s.name}</p>
                                <p className="text-sm text-zinc-400">R$ {Number(s.price).toFixed(2)}</p>
                            </button>
                        ))}
                      </div>
                  </div>

                  {/* Seleção de Barbeiro */}
                  <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800">
                      <h2 className="font-display text-xl font-bold text-amber-400 mb-4">2. Escolha o Profissional</h2>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {isLoading.barbers ? <p>A carregar...</p> : barbers.map(b => (
                            <button key={b.id} onClick={() => updateFormData({ barber: b })}
                                className={`p-3 border-2 rounded-lg text-center flex flex-col items-center gap-2 transition-all ${formData.barber?.id === b.id ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800 hover:bg-zinc-900'}`}>
                                <img src={getStrapiURL(b.avatar_url) || '/default-avatar.png'} alt={b.name} className="rounded-full object-cover w-16 h-16"/>
                                <p className="font-medium text-white text-sm mt-1">{b.name}</p>
                            </button>
                        ))}
                      </div>
                  </div>
              </div>

              {/* Coluna da Direita: Calendário e Horários */}
              <div className="lg:col-span-2 space-y-8">
                  <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800">
                     <h2 className="font-display text-xl font-bold text-amber-400 mb-4">3. Escolha a Data e Hora</h2>
                     {!formData.barber ? (
                        <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-center">
                            <Users size={32} className="mb-2"/>
                            <p>Selecione um profissional para ver os horários disponíveis.</p>
                        </div>
                     ) : (
                        <>
                            <div className="flex justify-center">
                                <DayPicker mode="single" selected={formData.date} onSelect={(d) => updateFormData({ date: d })} locale={ptBR} disabled={{ before: new Date() }}/>
                            </div>
                            <div className="mt-4 pt-4 border-t border-zinc-800">
                                {isLoading.slots ? (
                                    <div className="h-40 flex items-center justify-center"><Loader className="animate-spin text-amber-500" /></div>
                                ) : availableSlots.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-2">
                                        {availableSlots.map(time => (
                                            <button key={time} onClick={() => updateFormData({ time })}
                                                className={`p-2 border-2 text-sm rounded-lg transition-all ${formData.time === time ? 'border-amber-500 bg-amber-500 text-black font-bold' : 'border-zinc-700 hover:bg-zinc-800'}`}>
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-40 flex flex-col items-center justify-center text-zinc-500 text-center">
                                        <XCircle size={32} className="mb-2"/>
                                        <p>Nenhum horário disponível neste dia.</p>
                                    </div>
                                )}
                            </div>
                        </>
                     )}
                  </div>
                  
                  {isSelectionComplete && (
                      <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 animate-fade-in">
                          <h2 className="font-display text-xl font-bold text-amber-400 mb-4">4. Seus Dados</h2>
                          <form onSubmit={handleSubmit} className="space-y-4">
                              <input type="text" placeholder="Seu nome completo" value={formData.clientName} onChange={(e) => updateFormData({ clientName: e.target.value })} required className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                              <input type="tel" placeholder="Seu telefone (com DDD)" value={formData.clientPhone} onChange={(e) => updateFormData({ clientPhone: e.target.value })} required className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                              <button type="submit" disabled={isLoading.submit} className="w-full font-bold bg-green-600 text-white py-3 px-8 rounded-lg disabled:bg-zinc-700 disabled:cursor-not-allowed hover:bg-green-500 transition-colors">
                                  {isLoading.submit ? 'A agendar...' : 'Confirmar Agendamento'}
                              </button>
                          </form>
                      </div>
                  )}

              </div>
            </div>
        </div>
      </div>
    </>
  );
}

export default function AgendamentoPage() {
  return (
    <Suspense fallback={<div className="bg-black min-h-screen flex items-center justify-center text-white">Carregando...</div>}>
      <AgendamentoComponent />
    </Suspense>
  );
}