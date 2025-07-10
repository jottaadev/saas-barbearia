// src/app/page.js
import { ServiceCard } from '@/components/ServiceCard';
import { BarberCard } from '@/components/BarberCard';
import { Footer } from '@/components/Footer';
import { ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getStrapiURL } from '@/lib/utils'; // 1. Importar o nosso novo helper

export const dynamic = 'force-dynamic';

async function getServices() {
  try {
    const response = await fetch(getStrapiURL('/api/services'), { cache: 'no-store' });
    if (!response.ok) throw new Error('Falha ao buscar serviços');
    return response.json();
  } catch (error) {
    console.error("ERRO AO BUSCAR SERVIÇOS:", error.message);
    return [];
  }
}

async function getFeaturedBarbers() {
  try {
    const response = await fetch(getStrapiURL('/api/users/profiles'), { cache: 'no-store' });
    if (!response.ok) throw new Error('Falha ao buscar perfis');
    const profiles = await response.json();
    return profiles.filter(p => p.role === 'barber' && p.is_featured);
  } catch (error) {
    console.error("ERRO AO BUSCAR BARBEIROS EM DESTAQUE:", error.message);
    return [];
  }
}

export default async function Home() {
  headers(); 
  
  const allServices = await getServices();
  const featuredBarbers = await getFeaturedBarbers();
  const featuredServices = allServices.slice(0, 3);

  return (
    <main className="font-sans bg-black text-white min-h-screen flex-col items-center">
      
      {/* Seção Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 hero-bg hero-gradient">
        <div className="relative z-10 flex flex-col items-center gap-5" style={{ animation: 'hero-text-fade-in 1s 0.2s ease-out forwards', opacity: 0 }}>
          <span className="font-display text-amber-400 uppercase tracking-widest text-sm">Desde 2024</span>
          <h1 className="font-display font-bold text-5xl sm:text-7xl md:text-8xl text-white uppercase tracking-tighter">
            Estilo & Precisão
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 max-w-2xl font-light">
            Onde a tradição encontra a modernidade. A sua barbearia de confiança para um visual impecável.
          </p>
          <a href="/agendamento" className="shine-button mt-6 font-bold bg-amber-500 text-black py-4 px-12 rounded-full hover:bg-amber-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-amber-500/25">
            AGENDAR HORÁRIO
          </a>
        </div>
        <div className="absolute bottom-10 z-10 animate-bounce">
            <ArrowDown className="text-zinc-500" />
        </div>
      </section>

      {/* Seção Serviços */}
      <section id="servicos" className="py-28 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-slide-up-fade-in">
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-white">Serviços Exclusivos</h2>
            <p className="text-zinc-400 mt-4 max-w-xl mx-auto">
              Do clássico ao contemporâneo, cada serviço é executado com mestria para superar as suas expectativas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((service, index) => (
              <div key={service.id} className="animate-slide-up-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                  <ServiceCard service={service} />
              </div>
            ))}
          </div>
          {allServices.length > 3 && (
            <div className="text-center mt-16 animate-slide-up-fade-in" style={{ animationDelay: `${3 * 150}ms` }}>
              <Link href="/servicos" className="font-bold border border-zinc-700 text-zinc-300 py-3 px-10 rounded-full hover:bg-zinc-900 hover:border-amber-500 hover:text-amber-400 transition-all duration-300">
                Ver todos os serviços
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Seção Equipe */}
      <section id="equipe" className="py-28 px-6 bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-slide-up-fade-in">
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-white">Nossos Artistas</h2>
            <p className="text-zinc-400 mt-4 max-w-xl mx-auto">
              Profissionais apaixonados pela arte da barbearia, prontos para criar o seu visual perfeito.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredBarbers.length > 0 ? (
              featuredBarbers.map((barber, index) => (
                <div key={barber.id} className="animate-slide-up-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                  <BarberCard 
                    // 2. Usar o helper para construir a URL da imagem
                    imageSrc={getStrapiURL(barber.avatar_url) || '/default-avatar.png'}
                    name={barber.name} 
                    specialty={barber.role === 'admin' ? 'Fundador' : 'Barbeiro Especialista'}
                  />
                </div>
              ))
            ) : (
              <p className="text-zinc-500 col-span-3 text-center">A nossa equipa de destaque será apresentada aqui em breve.</p>
            )}
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}