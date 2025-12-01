import React, { useState } from 'react';

import { 
  MapPin, 
  Users,
} from 'lucide-react';

interface PontoEncontroProps {
    isDark: boolean,
}


const PontoEncontro: React.FC<PontoEncontroProps> = ({
    isDark,
}) => {
    const [destino, setDestino] = useState<string>('');
    const [lugaresAmigos, setLugaresAmigos] = useState<string[]>(['', '']);
    
    const adicionaAmigo = () => setLugaresAmigos([...lugaresAmigos, '']);
    const removeAmigo = (i: number) => {
        if (lugaresAmigos.length > 2) {
            setLugaresAmigos(lugaresAmigos.filter((_, idx) => idx !== i));
        }
    }

    const atualizaAmigo = (i: number, value: string) => {
        const lista = [...lugaresAmigos];
        lista[i] = value;
        setLugaresAmigos(lista);
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div
            className={`p-4 rounded-lg mb-6 text-sm ${
            isDark
                ? 'bg-indigo-900/20 text-indigo-200 border border-indigo-500/30'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
            }`}
        >
            Informe os endereços dos amigos que participarão do encontro. O sistema encontrará o melhor ponto central.
        </div>

        {/* DESTINO DO ENCONTRO */}
        <div className="mb-6">
            <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
            Destino do Encontro
            </label>

            <div
            className={`flex items-center px-3 py-2 rounded-lg border transition-all ${
                isDark
                ? 'bg-slate-800 border-slate-700 focus-within:border-indigo-500'
                : 'bg-gray-50 border-gray-200 focus-within:border-indigo-500'
            }`}
            >
            <MapPin className={`w-5 h-5 mr-3 text-indigo-500`} />
            <input
                type="text"
                placeholder="Ex: Hotel Copacabana Palace"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm font-medium"
            />
            </div>
        </div>
        

        {/* AMIGOS (vários campos dinâmicos) */}
        <div className="space-y-4">
            {lugaresAmigos.map((val, idx) => (
            <div key={idx}>
                <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
                Amigo {idx + 1}
                </label>

                <div
                className={`flex items-center px-3 py-2 rounded-lg border transition-all ${
                    isDark
                    ? 'bg-slate-800 border-slate-700 focus-within:border-indigo-500'
                    : 'bg-gray-50 border-gray-200 focus-within:border-indigo-500'
                }`}
                >
                <Users className="w-5 h-5 mr-3 text-emerald-500" />

                <input
                    type="text"
                    placeholder="Endereço do amigo"
                    value={val}
                    onChange={(e) => atualizaAmigo(idx, e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-sm font-medium"
                />

                {lugaresAmigos.length > 2 && (
                    <button
                    onClick={() => removeAmigo(idx)}
                    type="button"
                    className="ml-2 text-red-500 text-xs font-bold"
                    >
                    X
                    </button>
                )}
                </div>
            </div>
            ))}
        </div>

        <button
            type="button"
            onClick={adicionaAmigo}
            className="mt-4 w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
        >
            + Adicionar amigo
        </button>
        </div>
    )
}

export default PontoEncontro;