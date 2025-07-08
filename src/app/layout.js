// src/app/layout.js
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast'; // Importa o componente Toaster

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-inter'
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-poppins'
});

export const metadata = {
  title: 'Duarte Barbearia',
  description: 'A melhor experiência em cortes de cabelo e barba.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${poppins.variable} bg-zinc-950 font-sans`}>
        {/* Adiciona o Toaster aqui para que as notificações funcionem em todo o site */}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            className: '',
            style: {
              background: '#27272a', // zinc-800
              color: '#ffffff',
              border: '1px solid #3f3f46', // zinc-700
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}