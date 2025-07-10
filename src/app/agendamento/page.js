// src/app/agendamento/page.js
'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader, User, Scissors, Calendar, Sparkle, Combine, Gem, Palette, Wind, Utensils, Brush, Award, XCircle } from 'lucide-react';
import Link from 'next/link';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { getStrapiURL } from '@/lib/utils';

// --- Componente do Indicador de Etapa ---
const StepIndicator = ({ currentStep, totalSteps }) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center w-full mb-12">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                currentStep > step ? 'bg-amber-500 border-amber-500' : currentStep === step ? 'border-amber-500' : 'border-zinc-700'
              }`}
            >
              {currentStep > step ? <Check className="text-black" size={24} /> : <span className={`font-bold ${currentStep === step ? 'text-amber-500' : 'text-zinc-500'}`}>{step}</span>}
            </div>
          </div>
          {index < totalSteps - 1 && (
            <div className={`flex-1 h-1 transition-colors duration-500 mx-2 ${currentStep > step ? 'bg-amber-500' : 'bg-zinc-800'}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

function AgendamentoComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalSteps = 3;

  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const [isLoading, setIsLoading] = useState({ data: true, slots: false, submit: false });
  
  const [formData, setFormData] = useState({
    service: null,
    barber: null,
    date: new Date(),
    time: null,
    clientName: '',
    clientPhone: ''
  });

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
      setIsLoading(prev => ({ ...prev, data: false }));
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
        updateFormData({ time: null });
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

  const nextStep = () => setStep(prev => (prev < totalSteps ? prev + 1 : prev));
  const prevStep = () => setStep(prev => (prev > 1 ? prev - 1 : prev));

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

  if (isLoading.data) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center text-white">
        <Loader className="animate-spin text-amber-500" size={32}/>
        <span className="ml-4">A preparar o agendamento...</span>
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#27272a', color: '#fff', border: '1px solid #3f3f46' } }} />
      <div className="bg-black min-h-screen text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl">
          <header className="mb-4">
            <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition-colors">
              <ArrowLeft size={18} />
              Voltar para a página inicial
            </Link>
          </header>
          
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 sm:p-8">
            <StepIndicator currentStep={step} totalSteps={totalSteps} />

            {/* Conteúdo da Etapa */}
            <div className="mt-8 min-h-[400px]">
              {step === 1 && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h3 className="font-display font-medium text-2xl text-white mb-4">Escolha o Serviço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {services.map(s => (
                        <button key={s.id} onClick={() => updateFormData({ service: s })}
                          className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${formData.service?.id === s.id ? 'border-amber-500 bg-amber-500/10 scale-105' : 'border-zinc-800 hover:bg-zinc-900'}`}>
                          <p className="font-bold text-white">{s.name}</p>
                          <p className="text-sm text-zinc-400">R$ {Number(s.price).toFixed(2)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-2xl text-white mb-4">Escolha o Profissional</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {barbers.map(b => (
                        <button key={b.id} onClick={() => updateFormData({ barber: b })}
                          className={`p-3 border-2 rounded-lg text-center flex flex-col items-center gap-2 transition-all duration-200 ${formData.barber?.id === b.id ? 'border-amber-500 bg-amber-500/10 scale-105' : 'border-zinc-800 hover:bg-zinc-900'}`}>
                          <img src={getStrapiURL(b.avatar_url) || '/default-avatar.png'} alt={b.name} className="rounded-full object-cover w-20 h-20"/>
                          <p className="font-medium text-white text-sm mt-1">{b.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-fade-in">
                  <h3 className="font-display font-medium text-2xl text-white mb-4">Escolha a Data e Hora</h3>
                  {!formData.barber ? (
                    <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-center">
                        <User size={32} className="mb-2"/>
                        <p>Volte e selecione um profissional para ver os horários.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800 flex justify-center">
                            <DayPicker mode="single" selected={formData.date} onSelect={(d) => updateFormData({ date: d })} locale={ptBR} disabled={{ before: new Date() }}/>
                        </div>
                        <div className="max-h-80 overflow-y-auto pr-2">
                            {isLoading.slots ? (
                                <div className="h-40 flex items-center justify-center"><Loader className="animate-spin text-amber-500" /></div>
                            ) : availableSlots.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {availableSlots.map(time => (
                                        <button key={time} onClick={() => updateFormData({ time })}
                                            className={`p-3 border-2 text-sm rounded-lg transition-all ${formData.time === time ? 'border-amber-500 bg-amber-500 text-black font-bold' : 'border-zinc-700 hover:bg-zinc-800'}`}>
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-40 flex flex-col items-center justify-center text-zinc-500 text-center">
                                    <XCircle size={32} className="mb-2"/>
                                    <p>Nenhum horário disponível neste dia para {formData.barber.name}.</p>
                                </div>
                            )}
                        </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="max-w-md mx-auto animate-fade-in">
                    <h3 className="font-display font-medium text-2xl text-center text-white mb-6">Confirme os Seus Dados</h3>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6 space-y-1 text-sm">
                        <p className="text-zinc-400 flex justify-between">Serviço: <span className="text-white font-medium">{formData.service.name}</span></p>
                        <p className="text-zinc-400 flex justify-between">Profissional: <span className="text-white font-medium">{formData.barber.name}</span></p>
                        <p className="text-zinc-400 flex justify-between">Data: <span className="text-white font-medium">{format(formData.date, "dd/MM/yyyy")} às {formData.time}</span></p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" placeholder="Seu nome completo" value={formData.clientName} onChange={(e) => updateFormData({ clientName: e.target.value })} required className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                        <input type="tel" placeholder="Seu telefone (com DDD)" value={formData.clientPhone} onChange={(e) => updateFormData({ clientPhone: e.target.value })} required className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </form>
                </div>
              )}
            </div>

            {/* Botões de Navegação */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-zinc-800">
              <button onClick={prevStep} disabled={step === 1} className="font-bold py-2 px-6 rounded-full hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Voltar</button>
              
              {step < totalSteps && (
                <button 
                  onClick={nextStep} 
                  disabled={(step === 1 && (!formData.service || !formData.barber)) || (step === 2 && !formData.time)}
                  className="font-bold bg-amber-500 text-zinc-950 py-2 px-8 rounded-full disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors"
                >
                  Avançar
                </button>
              )}
              {step === totalSteps && (
                <button 
                  onClick={handleSubmit} 
                  disabled={isLoading.submit || !formData.clientName || !formData.clientPhone} 
                  className="font-bold bg-green-600 text-white py-2 px-8 rounded-full disabled:bg-zinc-700 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading.submit ? <><Loader size={16} className="animate-spin" /> Agendando...</> : 'Confirmar Agendamento'}
                </button>
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