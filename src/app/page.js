// src/app/page.js
import { ServiceCard } from '@/components/ServiceCard';
import { BarberCard } from '@/components/BarberCard';
import { Footer } from '@/components/Footer';
import { ArrowDown, Clock, MapPin, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getStrapiURL } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getServices() {
  try {
    const response = await fetch(getStrapiURL('/api/services'), { cache: 'no-store' });
    if (!response.ok) throw new Error('Falha ao buscar serviços');
    return await response.json();
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
          
          {/* ===== BOTÃO REINSERIDO E CORRIGIDO AQUI ===== */}
          {allServices.length > 3 && (
            <div className="text-center mt-16 animate-slide-up-fade-in" style={{ animationDelay: `${3 * 150}ms` }}>
              <Link href="/servicos" className="font-bold border border-zinc-700 text-zinc-300 py-3 px-10 rounded-full hover:bg-zinc-900 hover:border-amber-500 hover:text-amber-400 transition-all duration-300">
                Ver todos os serviços
              </Link>
            </div>
          )}
        </div>
      </section>

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
      
      <section id="localizacao" className="py-28 px-6 bg-black">
        <div className="max-w-5xl mx-auto animate-slide-up-fade-in">
            <div className="text-center mb-16">
                <h2 className="font-display font-bold text-4xl sm:text-5xl text-white">Onde Estamos</h2>
                <p className="text-zinc-400 mt-4 max-w-xl mx-auto">
                    Um ambiente moderno e confortável, projetado para si relaxar enquanto cuidamos do seu estilo.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                <div className="lg:col-span-3 h-80 lg:h-[500px]">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.197574883467!2d-46.65882238493442!3d-23.5613393675464!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c97763!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1678886567654!5m2!1spt-BR!2sbr0"
                    width="100%" 
                    height="100%" 
                    style={{ border:0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização da Barbearia">
                  </iframe>
                </div>
                <div className="lg:col-span-2 p-8 lg:p-10 flex flex-col justify-center space-y-8 bg-black/50">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="text-amber-500" size={20} />
                      <h3 className="font-display font-bold text-xl text-white">Horários</h3>
                    </div>
                    <div className="pl-8 text-zinc-300 text-sm space-y-1">
                      <p>Terça a Sábado: 09:00 - 19:00</p>
                      <p>Domingo: 09:00 - 12:00</p>
                      <p>Segunda-feira: <span className="font-bold text-red-500">Fechado</span></p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="text-amber-500" size={20} />
                      <h3 className="font-display font-bold text-xl text-white">Endereço</h3>
                    </div>
                    <p className="pl-8 text-zinc-300 text-sm">Av. Paulista, 1234 - São Paulo, SP</p>
                  </div>
                   <div className="pt-4">
                        <a 
                          href="https://wa.me/5511987654321" target="_blank" rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-3 font-bold bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-500 transition-all duration-300 transform hover:scale-105"
                        >
                          <MessageCircle size={20} /> Entrar em Contacto
                        </a>
                   </div>
                </div>
            </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
