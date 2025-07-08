// src/app/agendamento/confirmado/page.js
'use client';

import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ConfirmationContent() {
  const searchParams = useSearchParams();

  // Lendo os dados do agendamento do URL
  const service = searchParams.get('servico');
  const barber = searchParams.get('barbeiro');
  const date = searchParams.get('data');
  const time = searchParams.get('hora');

  // Formatar a data para um formato mais legível
  const formattedDate = date ? new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'Data não informada';

  return (
    <div className="bg-black min-h-screen text-white font-sans flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="w-full max-w-md">
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-8 space-y-6 flex flex-col items-center">
          
          <CheckCircle2 className="text-green-500" size={64} />
          
          <h1 className="font-title font-bold text-3xl text-white">Agendamento Confirmado!</h1>
          
          <p className="text-zinc-400">
            O seu horário foi reservado com sucesso. Estamos à sua espera!
          </p>

          <div className="w-full text-left bg-zinc-900 border border-zinc-800 rounded-lg p-4 mt-4 space-y-2">
            <h2 className="font-title text-amber-500 text-lg mb-2">Detalhes da Reserva</h2>
            <p className="text-zinc-300"><strong>Serviço:</strong> {service}</p>
            <p className="text-zinc-300"><strong>Data:</strong> {formattedDate}</p>
            <p className="text-zinc-300"><strong>Hora:</strong> {time}</p>
            <p className="text-zinc-300"><strong>Barbeiro:</strong> {barber}</p>
          </div>

          <Link href="/" className="mt-6 font-bold bg-amber-500 text-zinc-950 py-3 px-8 rounded-full hover:bg-amber-400 transition-colors w-full">
            Voltar para a Página Inicial
          </Link>

        </div>
      </div>
    </div>
  );
}

// Usamos o Suspense para lidar com o carregamento dos parâmetros da URL
export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div>A carregar...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}