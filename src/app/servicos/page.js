// src/app/servicos/page.js
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { Footer } from '@/components/Footer'; // Ajuste o caminho se necessário
import { Scissors, Sparkle, Combine, Gem, Palette, Wind, Mustache, Utensils, Brush, Award } from 'lucide-react';

// O mesmo mapa de ícones que usamos no ServiceCard
const iconMap = {
  scissors: Scissors, sparkle: Sparkle, combine: Combine, gem: Gem,
  palette: Palette, wind: Wind, mustache: Mustache, utensils: Utensils,
  brush: Brush, award: Award,
};

// Função para buscar os dados dos serviços da nossa API
async function getServices() {
  try {
    const response = await axios.get('http://localhost:3333/api/services');
    return response.data;
  } catch (error) {
    console.error("ERRO AO BUSCAR SERVIÇOS:", error.message);
    return [];
  }
}

// Componente para um cartão de serviço individual, com um design mais detalhado
const FullServiceCard = ({ service }) => {
  const Icon = iconMap[service.icon_name] || Scissors;

  return (
    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-zinc-800 rounded-lg">
          <Icon className="text-amber-500" size={24} />
        </div>
        <h3 className="font-display font-bold text-xl text-white">{service.name}</h3>
      </div>
      <p className="font-sans text-zinc-400 text-sm flex-grow mb-4">
        {service.description || 'Descrição detalhada do serviço em breve.'}
      </p>
      <div className="flex items-center justify-between border-t border-zinc-800 pt-4 mb-5">
          <div className="flex items-center gap-2 text-zinc-300">
              <Clock size={16} className="text-amber-500"/>
              <span className="font-sans font-medium">{service.duration_minutes} min</span>
          </div>
          <p className="font-display font-bold text-2xl text-white">R$ {Number(service.price).toFixed(2)}</p>
      </div>
      <Link 
        href={`/agendamento?servico=${service.id}`} 
        className="w-full text-center mt-auto bg-amber-500 text-zinc-950 font-bold py-2 px-4 rounded-lg hover:bg-amber-400 transition-colors">
        Agendar Agora
      </Link>
    </div>
  );
};

// Componente Principal da Página
export default async function ServicosPage() {
  const services = await getServices();

  return (
    <div className="bg-black text-white">
      <main className="min-h-screen">
        {/* Secção de Cabeçalho */}
        <section className="py-20 px-6 text-center bg-zinc-950">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition-colors mb-8">
              <ArrowLeft size={16} />
              Voltar para a página inicial
            </Link>
            <h1 className="font-display font-bold text-5xl sm:text-6xl text-amber-500">Nossos Serviços</h1>
            <p className="font-sans text-lg text-zinc-300 max-w-2xl mx-auto mt-4">
              Explore a nossa gama completa de serviços premium, desenhados para realçar o seu melhor estilo com precisão e cuidado.
            </p>
          </div>
        </section>

        {/* Grelha de Serviços */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            {services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map(service => (
                  <FullServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-zinc-500">Não foi possível carregar os serviços. Tente novamente mais tarde.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}