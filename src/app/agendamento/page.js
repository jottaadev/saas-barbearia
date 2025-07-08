// src/app/agendamento/page.js
'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Loader, XCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

// --- COMPONENTES DAS ETAPAS (Definidos fora para evitar bugs de renderização) ---

const Step1 = ({ formData, updateFormData, services, barbers }) => (
  <div className="space-y-8 animate-fade-in">
    <div>
      <h3 className="font-display font-medium text-lg text-white mb-3">1. Escolha o Serviço</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {services.map(service => (
          <button key={service.id} onClick={() => updateFormData({ service })} className={`p-4 border-2 rounded-lg text-left transition-colors ${formData.service?.id === service.id ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}>
            <p className="font-bold text-white">{service.name}</p>
            <p className="text-sm text-zinc-400">{service.duration_minutes} min - R$ {Number(service.price).toFixed(2)}</p>
          </button>
        ))}
      </div>
    </div>
    <div>
      <h3 className="font-display font-medium text-lg text-white mb-3">2. Escolha o Barbeiro</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {barbers.map(barber => (
          <button key={barber.id} onClick={() => updateFormData({ barber, date: null, time: null })} className={`p-4 border-2 rounded-lg text-center flex flex-col items-center gap-2 transition-colors ${formData.barber?.id === barber.id ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}>
            <img src={barber.avatar_url ? `http://localhost:3333${barber.avatar_url}` : '/default-avatar.png'} alt={barber.name} className="rounded-full object-cover w-20 h-20"/>
            <p className="font-bold text-white mt-2">{barber.name}</p>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const Step2 = ({ formData, updateFormData, availableSlots, isLoadingSlots }) => (
    <div className="space-y-6 animate-fade-in">
        <div>
            <h3 className="font-display font-medium text-lg text-white mb-3">3. Escolha a Data e o Horário</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800 flex justify-center">
                    <DayPicker mode="single" selected={formData.date} onSelect={(date) => updateFormData({ date, time: null })} locale={ptBR} disabled={{ before: new Date() }} className="text-white"/>
                </div>
                <div>
                    {isLoadingSlots ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader className="animate-spin text-amber-500" />
                        </div>
                    ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                            {availableSlots.map(time => (
                                <button key={time} onClick={() => updateFormData({ time })} className={`p-3 border-2 rounded-lg transition-colors ${formData.time === time ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}>{time}</button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-zinc-500 p-4 h-48 flex flex-col justify-center items-center bg-zinc-900 rounded-md">
                            <XCircle className="mb-2"/>
                            <span>Nenhum horário disponível para este dia.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
);

const Step3 = ({ formData, updateFormData }) => (
  <div className="space-y-6 animate-fade-in">
    <h3 className="font-display font-medium text-lg text-white mb-3">Quase lá! Faltam seus dados</h3>
    <div className="space-y-4">
      <input type="text" placeholder="Seu nome completo" value={formData.clientName} onChange={(e) => updateFormData({ clientName: e.target.value })} className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
      <input type="tel" placeholder="Seu melhor telefone (com DDD)" value={formData.clientPhone} onChange={(e) => updateFormData({ clientPhone: e.target.value })} className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
    </div>
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mt-6 space-y-2">
      <h4 className="font-display text-white">Resumo do Agendamento</h4>
      <p className="text-zinc-300"><strong>Serviço:</strong> {formData.service?.name || '...'}</p>
      <p className="text-zinc-300"><strong>Data:</strong> {formData.date?.toLocaleDateString('pt-BR') || '...'} às {formData.time || '...'}</p>
      <p className="text-zinc-300"><strong>Barbeiro:</strong> {formData.barber?.name || '...'}</p>
    </div>
  </div>
);


// --- COMPONENTE PRINCIPAL (Wrapper para carregar dados) ---

function AgendamentoComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState('');

  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  const [formData, setFormData] = useState({
    service: null, date: null, time: null, barber: null, clientName: '', clientPhone: '',
  });

  const updateFormData = useCallback((newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
    setError('');
  }, []);

  // Busca os dados iniciais (serviços e barbeiros)
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [servicesResponse, profilesResponse] = await Promise.all([
            axios.get('http://localhost:3333/api/services'),
            axios.get('http://localhost:3333/api/users/profiles')
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
        setError('Não foi possível carregar os dados para o agendamento.');
      } finally {
        setIsDataLoading(false);
      }
    }
    fetchInitialData();
  }, [searchParams, updateFormData]);

  // Busca a disponibilidade sempre que o barbeiro ou a data mudam
  useEffect(() => {
    if (formData.barber && formData.date) {
      const fetchAvailability = async () => {
        setIsLoadingSlots(true);
        setAvailableSlots([]); // Limpa os horários antigos enquanto busca os novos
        try {
          const formattedDate = format(formData.date, 'yyyy-MM-dd');
          const response = await axios.get(`http://localhost:3333/api/public/availability`, {
            params: { barberId: formData.barber.id, date: formattedDate }
          });
          setAvailableSlots(response.data);
        } catch (err) {
          setAvailableSlots([]);
          toast.error("Erro ao buscar horários para este dia.");
        } finally {
          setIsLoadingSlots(false);
        }
      };
      fetchAvailability();
    }
  }, [formData.barber, formData.date]);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const isStep1Complete = formData.service && formData.barber;
  const isStep2Complete = formData.date && formData.time;
  const isStep3Complete = formData.clientName.trim() !== '' && formData.clientPhone.trim() !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const date = new Date(formData.date);
      const [hours, minutes] = formData.time.split(':');
      date.setHours(hours);
      date.setMinutes(minutes);
      const appointmentData = {
        serviceId: formData.service.id, barberId: formData.barber.id,
        clientName: formData.clientName, clientPhone: formData.clientPhone,
        appointmentTime: date.toISOString(),
      };
      await axios.post('http://localhost:3333/api/appointments', appointmentData);
      const params = new URLSearchParams({
        servico: formData.service.name, barbeiro: formData.barber.name,
        data: formData.date.toISOString().split('T')[0], hora: formData.time,
      });
      router.push(`/agendamento/confirmado?${params.toString()}`);
    } catch (err) {
      setError('Não foi possível realizar o agendamento.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isDataLoading) {
    return <div className="bg-black min-h-screen flex items-center justify-center text-white"><Loader className="animate-spin text-amber-500" size={32}/> <span className="ml-4">A preparar o agendamento...</span></div>;
  }

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#27272a', color: '#fff', border: '1px solid #3f3f46' } }} />
      <div className="bg-black min-h-screen text-white font-sans flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl">
          <div className="mb-4"><Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition-colors"><ArrowLeft size={18} />Voltar para a página inicial</Link></div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">{['Escolha', 'Horário', 'Seus Dados'].map((label, index) => (<React.Fragment key={label}><div className="flex flex-col items-center text-center"><div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step > index ? 'bg-amber-500 border-amber-500 text-black' : 'border-zinc-700'}`}>{step > index ? <Check size={20} /> : index + 1}</div><p className={`mt-2 text-xs transition-colors duration-300 ${step > index ? 'text-white' : 'text-zinc-500'}`}>{label}</p></div>{index < 2 && <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${step > index + 1 ? 'bg-amber-500' : 'bg-zinc-800'}`} />}</React.Fragment>))}</div>
            <div className="pt-6 border-t border-zinc-800">
              {step === 1 && <Step1 formData={formData} updateFormData={updateFormData} services={services} barbers={barbers} />}
              {step === 2 && <Step2 formData={formData} updateFormData={updateFormData} availableSlots={availableSlots} isLoadingSlots={isLoadingSlots} />}
              {step === 3 && <Step3 formData={formData} updateFormData={updateFormData} />}
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div className="flex justify-end pt-6 border-t border-zinc-800 items-center">
              {step > 1 && (<button onClick={prevStep} className="font-bold py-2 px-6 rounded-full hover:bg-zinc-800 transition-colors">Voltar</button>)}
              {step < 3 && (<button onClick={nextStep} disabled={(step === 1 && !isStep1Complete) || (step === 2 && !isStep2Complete)} className="font-bold bg-amber-500 text-zinc-950 py-2 px-8 rounded-full disabled:bg-zinc-700 disabled:cursor-not-allowed ml-auto">Avançar</button>)}
              {step === 3 && (<button onClick={handleSubmit} disabled={!isStep3Complete || isLoading} className="font-bold bg-green-600 text-white py-2 px-8 rounded-full disabled:bg-zinc-700 disabled:cursor-not-allowed ml-auto">{isLoading ? 'A agendar...' : 'Confirmar Agendamento'}</button>)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Usamos Suspense para garantir que a página espera pelos parâmetros do URL
export default function AgendamentoPage() {
  return (
    <Suspense>
      <AgendamentoComponent />
    </Suspense>
  );
}