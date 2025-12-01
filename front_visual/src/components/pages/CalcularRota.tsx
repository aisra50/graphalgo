import React, { useState } from 'react';

import { 
  MapPin, 
  Search
} from 'lucide-react';

interface CalcularRotaProps {
  isDark: boolean;
  loading: boolean;
}


function calculaRota(origem: string, destino: string, turno: string)
{

}

const CalcularRota: React.FC<CalcularRotaProps> = ({
    isDark, 
    loading
}) => {
    const [origem, setOrigem] = useState<string>('');
    const [destino, setDestino] = useState<string>('');
    
    function getCurrentTurno () {
        return isDark ? 'noite' : 'dia';
    }

    function handleRouteSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!origin.trim() || !destino.trim()) return;

        calculaRota(origem, destino, getCurrentTurno());
    }

    return (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <form onSubmit={handleRouteSubmit} className="space-y-4">

                {/* ORIGEM */}
                <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
                    Origem
                </label>
                <div
                    className={`flex items-center px-3 py-2 rounded-lg border transition-all ${
                    isDark
                        ? 'bg-slate-800 border-slate-700 focus-within:border-indigo-500'
                        : 'bg-gray-50 border-gray-200 focus-within:border-indigo-500'
                    }`}
                >
                    <MapPin
                    className={`w-5 h-5 mr-3 ${
                        isDark ? 'text-emerald-400' : 'text-emerald-600'
                    }`}
                    />
                    <input
                    type="text"
                    value={origem}
                    onChange={(e) => setOrigem(e.target.value)}
                    placeholder="Ex: Forte de Copacabana"
                    disabled={loading}
                    className="bg-transparent border-none outline-none w-full text-sm font-medium"
                    />
                </div>
                </div>

                {/* DESTINO */}
                <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
                    Destino
                </label>
                <div
                    className={`flex items-center px-3 py-2 rounded-lg border transition-all ${
                    isDark
                        ? 'bg-slate-800 border-slate-700 focus-within:border-indigo-500'
                        : 'bg-gray-50 border-gray-200 focus-within:border-indigo-500'
                    }`}
                >
                    <MapPin
                    className={`w-5 h-5 mr-3 ${
                        isDark ? 'text-red-400' : 'text-red-600'
                    }`}
                    />
                    <input
                    type="text"
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    placeholder="Ex: Hotel Copacabana Palace"
                    disabled={loading}
                    className="bg-transparent border-none outline-none w-full text-sm font-medium"
                    />
                </div>
                </div>

                <button
                type="submit"
                disabled={loading || !origem || !destino}
                className={`w-full py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                    loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                }`}
                >
                {loading ? (
                    <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Calculando...
                    </>
                ) : (
                    <>
                    <Search className="w-4 h-4" />
                    Buscar Caminho
                    </>
                )}
                </button>
            </form>
        </div>
    )
}

export default CalcularRota;