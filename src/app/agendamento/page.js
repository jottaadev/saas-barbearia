// src/app/agendamento/page.js
'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Loader, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

// --- Componente de Validação de Etapa ---
const StepValidation = ({ isComplete, children }) => (
  <div className={`flex flex-col items-center text-center ${isComplete ? 'text-white' : 'text-zinc-500'}`}>
    {children}
  </div>
);

// --- COMPONENTES DAS ETAPAS ---

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
          <button key={barber.id} onClick={() => updateFormData({ barber })} className={`p-4 border-2 rounded-lg text-center flex flex-col items-center gap-2 transition-colors ${formData.barber?.id === barber.id ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}>
            <img src={barber.avatar_url ? `https://backend-barber-5sbe.onrender.com${barber.avatar_url}` : '/default-avatar.png'} alt={barber.name} className="rounded-full object-cover w-20 h-20"/>
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
                    <DayPicker mode="single" selected={formData.date} onSelect={(date) => updateFormData({ date })} locale={ptBR} disabled={{ before: new Date() }} className="text-white"/>
                </div>
                <div className="max-h-72 overflow-y-auto pr-2">
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

const Step3 = ({ formData, updateFormData, validationErrors }) => (
  <div className="space-y-6 animate-fade-in">
    <h3 className="font-display font-medium text-lg text-white mb-3">Quase lá! Faltam seus dados</h3>
    <div className="space-y-4">
      <div>
        <input type="text" placeholder="Seu nome completo" value={formData.clientName} onChange={(e) => updateFormData({ clientName: e.target.value })} className={`w-full p-3 bg-zinc-900 border rounded-lg text-white focus:outline-none focus:ring-2 ${validationErrors.clientName ? 'border-red-500 focus:ring-red-500' : 'border-zinc-800 focus:ring-amber-500'}`} />
        {validationErrors.clientName && <p className="text-red-500 text-xs mt-1">{validationErrors.clientName}</p>}
      </div>
      <div>
        <input type="tel" placeholder="Seu telefone (Ex: 11987654321)" value={formData.clientPhone} onChange={(e) => updateFormData({ clientPhone: e.target.value })} className={`w-full p-3 bg-zinc-900 border rounded-lg text-white focus:outline-none focus:ring-2 ${validationErrors.clientPhone ? 'border-red-500 focus:ring-red-500' : 'border-zinc-800 focus:ring-amber-500'}`} />
        {validationErrors.clientPhone && <p className="text-red-500 text-xs mt-1">{validationErrors.clientPhone}</p>}
      </div>
    </div>
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mt-6 space-y-2">
      <h4 className="font-display text-white">Resumo do Agendamento</h4>
      <p className="text-zinc-300"><strong>Serviço:</strong> {formData.service?.name || '...'}</p>
      <p className="text-zinc-300"><strong>Data:</strong> {formData.date ? format(formData.date, 'dd/MM/yyyy') : '...'} às {formData.time || '...'}</p>
      <p className="text-zinc-300"><strong>Barbeiro:</strong> {formData.barber?.name || '...'}</p>
    </div>
  </div>
);

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
    service: null, barber: null, date: null, time: null, clientName: '', clientPhone: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  const updateFormData = useCallback((newData) => {
    // Lógica para resetar os passos seguintes
    const newFormState = { ...formData, ...newData };
    if (newData.service && newData.service.id !== formData.service?.id) {
      newFormState.barber = null; newFormState.date = null; newFormState.time = null;
    }
    if (newData.barber && newData.barber.id !== formData.barber?.id) {
      newFormState.date = null; newFormState.time = null;
    }
    if (newData.date && newData.date !== formData.date) {
      newFormState.time = null;
    }

    setFormData(newFormState);
    setError('');
  }, [formData]);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [servicesResponse, profilesResponse] = await Promise.all([
            axios.get('https://backend-barber-5sbe.onrender.com/api/services'),
            axios.get('https://backend-barber-5sbe.onrender.com/api/users/profiles')
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

  useEffect(() => {
    if (formData.barber && formData.date) {
      const fetchAvailability = async () => {
        setIsLoadingSlots(true);
        setAvailableSlots([]);
        try {
          const formattedDate = format(formData.date, 'yyyy-MM-dd');
          const response = await axios.get(`https://backend-barber-5sbe.onrender.com/api/public/availability`, {
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

  const validateStep3 = () => {
    const errors = {};
    if (formData.clientName.trim().split(' ').length < 2) {
      errors.clientName = 'Por favor, insira seu nome e sobrenome.';
    }
    if (!/^\d{10,11}$/.test(formData.clientPhone.replace(/\D/g, ''))) {
      errors.clientPhone = 'Por favor, insira um telefone válido com DDD (apenas números).';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const isStep1Complete = formData.service && formData.barber;
  const isStep2Complete = formData.date && formData.time;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) {
        toast.error("Por favor, corrija os erros no formulário.");
        return;
    }
    setIsLoading(true);
    setError('');
    try {
      const date = new Date(formData.date);
      const [hours, minutes] = formData.time.split(':');
      date.setHours(hours); date.setMinutes(minutes);

      const appointmentData = {
        serviceId: formData.service.id, barberId: formData.barber.id,
        clientName: formData.clientName, clientPhone: formData.clientPhone,
        appointmentTime: date.toISOString(),
      };
      await axios.post('https://backend-barber-5sbe.onrender.com/api/appointments', appointmentData);
      
      const params = new URLSearchParams({
        servico: formData.service.name, barbeiro: formData.barber.name,
        data: formData.date.toISOString().split('T')[0], hora: formData.time,
      });
      router.push(`/agendamento/confirmado?${params.toString()}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível realizar o agendamento.');
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
            <div className="flex items-start justify-between">
              {['Escolha', 'Horário', 'Seus Dados'].map((label, index) => (
                <React.Fragment key={label}>
                  <StepValidation isComplete={step > index}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step > index ? 'bg-amber-500 border-amber-500 text-black' : 'border-zinc-700'}`}>
                      {step > index ? <Check size={20} /> : index + 1}
                    </div>
                    <p className="mt-2 text-xs transition-colors duration-300">{label}</p>
                  </StepValidation>
                  {index < 2 && <div className={`flex-1 h-0.5 mx-2 mt-4 transition-colors duration-300 ${step > index + 1 ? 'bg-amber-500' : 'bg-zinc-800'}`} />}
                </React.Fragment>
              ))}
            </div>

            <div className="pt-6 border-t border-zinc-800">
              {step === 1 && <Step1 formData={formData} updateFormData={updateFormData} services={services} barbers={barbers} />}
              {step === 2 && <Step2 formData={formData} updateFormData={updateFormData} availableSlots={availableSlots} isLoadingSlots={isLoadingSlots} />}
              {step === 3 && <Step3 formData={formData} updateFormData={updateFormData} validationErrors={validationErrors} />}
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            <div className="flex justify-between items-center pt-6 border-t border-zinc-800">
              <button onClick={prevStep} disabled={step === 1} className="font-bold py-2 px-6 rounded-full hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Voltar</button>
              
              {step < 3 && (
                  <button onClick={nextStep} disabled={(step === 1 && !isStep1Complete) || (step === 2 && !isStep2Complete)} className="font-bold bg-amber-500 text-zinc-950 py-2 px-8 rounded-full disabled:bg-zinc-700 disabled:cursor-not-allowed">Avançar</button>
              )}
              {step === 3 && (
                  <button onClick={handleSubmit} disabled={isLoading} className="font-bold bg-green-600 text-white py-2 px-8 rounded-full disabled:bg-zinc-700 disabled:cursor-not-allowed flex items-center gap-2">
                    {isLoading ? <><Loader2 className="animate-spin" size={16}/> Agendando...</> : 'Confirmar Agendamento'}
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