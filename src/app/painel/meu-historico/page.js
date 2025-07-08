// src/app/painel/meu-historico/page.js
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from '../../../components/painel/Sidebar';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { History, AlertCircle } from 'lucide-react';

export default function MeuHistoricoPage() {
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = sessionStorage.getItem('authToken');
        if (!token) { router.push('/painel/selecao-perfil'); return; }
        try {
            const decodedUser = jwtDecode(token);
            setUser(decodedUser);

            const fetchHistory = async () => {
                try {
                    const response = await axios.get('http://localhost:3333/api/barber/history', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setHistory(response.data);
                } catch (err) {
                    setError('Não foi possível carregar o seu histórico.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchHistory();
        } catch (error) {
            router.push('/painel/selecao-perfil');
        }
    }, [router]);

    if (!user) {
        return <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-white">A verificar...</div>;
    }

    return (
        <div className="bg-zinc-950 min-h-screen text-white flex font-sans">
            <Sidebar user={user} />
            <main className="flex-1 p-8">
                <h1 className="font-display font-bold text-4xl text-white mb-8">Meu Histórico de Atendimentos</h1>

                {isLoading && <p>A carregar histórico...</p>}
                {error && <div className="bg-red-900/20 text-red-400 p-4 rounded-lg flex items-center gap-3"><AlertCircle size={20}/> {error}</div>}

                <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-800">
                            <tr>
                                <th className="p-4 font-bold text-sm text-zinc-400 uppercase">Cliente</th>
                                <th className="p-4 font-bold text-sm text-zinc-400 uppercase">Serviço</th>
                                <th className="p-4 font-bold text-sm text-zinc-400 uppercase">Data</th>
                                <th className="p-4 font-bold text-sm text-zinc-400 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? history.map(item => (
                                <tr key={item.id} className="border-t border-zinc-800">
                                    <td className="p-4 font-medium text-white">{item.client_name}</td>
                                    <td className="p-4 text-zinc-300">{item.service_name}</td>
                                    <td className="p-4 text-zinc-300">{new Date(item.appointment_time).toLocaleDateString('pt-BR')}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                            item.status === 'Concluído' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                !isLoading && <tr><td colSpan="4" className="p-4 text-center text-zinc-500">Nenhum registo encontrado no seu histórico.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}