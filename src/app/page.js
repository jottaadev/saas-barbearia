// src/app/page.js
import { ServiceCard } from '@/components/ServiceCard';
import { BarberCard } from '@/components/BarberCard';
import { Footer } from '@/components/Footer';
import { Clock, Phone, MapPin, MessageCircle } from 'lucide-react';
import axios from 'axios';

// Função para buscar os serviços da API
async function getServices() {
  try {
    const response = await axios.get('https://backend-barber-5sbe.onrender.com/api/services');
    return response.data;
  } catch (error) {
    console.error("ERRO AO BUSCAR SERVIÇOS:", error.message);
    return [];
  }
}

// Função para buscar APENAS os barbeiros em destaque
async function getFeaturedBarbers() {
  try {
    const response = await axios.get('https://backend-barber-5sbe.onrender.com/api/users/profiles');
    // Filtra a lista para pegar apenas os que são 'barber' e têm 'is_featured' como true
    return response.data.filter(p => p.role === 'barber' && p.is_featured);
  } catch (error) {
    console.error("ERRO AO BUSCAR BARBEIROS EM DESTAQUE:", error.message);
    return [];
  }
}

export default async function Home() {
  // Busca os dados dinâmicos ao carregar a página
  const services = await getServices();
  const featuredBarbers = await getFeaturedBarbers();

  return (
    <main className="font-sans min-h-screen flex-col items-center">
      
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 hero-bg">
        <div className="absolute inset-0 bg-black/70 z-0" />
        <div className="relative z-10 flex flex-col items-center gap-6 fade-in">
          <h1 className="font-display font-bold text-6xl sm:text-7xl md:text-8xl text-amber-500 uppercase tracking-tight">
            Arte em Cada Corte
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 max-w-2xl">
            Transformamos estilos e elevamos sua confiança. A sua busca pela barbearia perfeita termina aqui.
          </p>
          <a href="/agendamento" className="mt-4 font-bold bg-amber-500 text-black py-3 px-10 rounded-full hover:bg-amber-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-amber-500/20">
            AGENDAR AGORA
          </a>
        </div>
      </section>

      <section id="servicos" className="py-24 px-6 bg-black">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-center text-white mb-4">Nossos Serviços</h2>
          <p className="text-center text-zinc-400 mb-12 max-w-xl mx-auto">
            Oferecemos uma gama de serviços para garantir que você saia daqui com o visual renovado e a confiança em alta.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.slice(0, 3).map(service => (
              <ServiceCard 
                key={service.id}
                iconName={service.icon_name || 'scissors'}
                title={service.name}
                price={service.price}
                duration={service.duration_minutes}
              />
            ))}
          </div>
          <div className="text-center mt-12">
            <a href="/servicos" className="font-bold border border-amber-500 text-amber-500 py-3 px-10 rounded-full hover:bg-amber-500 hover:text-black transition-all duration-300">
              Ver todos os serviços
            </a>
          </div>
        </div>
      </section>

      <section id="equipe" className="py-24 px-6 bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-center text-white mb-4">Nossa Equipe</h2>
          <p className="text-center text-zinc-400 mb-12 max-w-xl mx-auto">
            Conheça os artistas por trás das tesouras. Profissionais dedicados a realçar o seu melhor estilo.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* --- SECÇÃO DA EQUIPA AGORA 100% DINÂMICA --- */}
            {featuredBarbers.length > 0 ? (
              featuredBarbers.map(barber => (
                <BarberCard 
                  key={barber.id}
                  // Usamos o caminho completo para a imagem, vinda do backend
                  imageSrc={barber.avatar_url ? `https://backend-barber-5sbe.onrender.com${barber.avatar_url}` : '/default-avatar.png'}
                  name={barber.name} 
                  specialty={barber.username} // Podemos criar um campo "specialty" no futuro
                />
              ))
            ) : (
              <p className="text-zinc-500 col-span-3 text-center">A nossa equipa de destaque será apresentada aqui em breve.</p>
            )}
          </div>
        </div>
      </section>

      <section id="localizacao" className="py-24 px-6 bg-black">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-center text-white mb-4">Venha nos Visitar</h2>
          <p className="text-center text-zinc-400 mb-16 max-w-xl mx-auto">
            Encontre nosso espaço, pensado para o seu conforto e conveniência.
          </p>
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center bg-zinc-950 border border-zinc-800 p-8 rounded-lg">
            <div className="w-full lg:w-1/2 h-80 lg:h-96 rounded-md overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d14627.656876122013!2d-46.56382775488728!3d-23.57152413652535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sAvenida%20Avenida%20Sapopemba%2C%204178%2C%20Sal%C3%A3o%2C%20Sapopemba%2C%20S%C3%A3o%20Paulo%2C%20SP%20-%2003374-000!5e0!3m2!1spt-BR!2sbr!4v1751680692238!5m2!1spt-BR!2sbr"
                width="100%" 
                height="100%" 
                style={{ border:0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
            <div className="w-full lg:w-1/2 text-left space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="text-amber-500" size={24} />
                  <h3 className="font-display font-bold text-2xl text-white">Horário de Abertura</h3>
                </div>
                <div className="pl-9 space-y-2 text-zinc-300">
                  <p><strong>Domingo:</strong> 09:00 às 12:00</p>
                  <p><strong>Segunda-Feira:</strong> <span className="font-bold text-red-500">Fechado</span></p>
                  <p><strong>Terça-Feira a Sábado:</strong> 09:00 às 19:00</p>
                </div>
              </div>
              <div className="pt-6">
                <a 
                  href="https://wa.me/5511999999999"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-3 font-bold bg-green-500 text-white py-4 px-6 rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
                >
                  <MessageCircle size={24} />
                  Entrar em Contacto por WhatsApp
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