import React, { useState } from 'react';
import { Lugar } from '../../types';

import { 
  MapPin, 
  Network
} from 'lucide-react';

interface ComponenteConexoProps {
    isDark: boolean,
    lugares: Lugar[]
}

const ComponenteConexo: React.FC<ComponenteConexoProps> = ({
    isDark,
    lugares
}) => {
  // Connectivity State
  const [connDestination, setConnDestination] = useState('');
  const [connPoints, setConnPoints] = useState<string[]>(['', '']);


  const addConn = () => setConnPoints([...connPoints, '']);
  const removeConn = (i: number) => {
    if (connPoints.length > 1) {
      setConnPoints(connPoints.filter((_, idx) => idx !== i));
    }
  }
  const updateConn = (i: number, value: string) => {
    const lista = [...connPoints];
    lista[i] = value;
    setConnPoints(lista);
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
        Informe os pontos que devem ser verificados e o destino final.
      </div>

      {/* DESTINO DA CONEXÃO */}
      <div className="mb-6">
        <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
          Destino principal
        </label>

        <div
          className={`flex items-center px-3 py-2 rounded-lg border transition-all ${
            isDark
              ? 'bg-slate-800 border-slate-700 focus-within:border-indigo-500'
              : 'bg-gray-50 border-gray-200 focus-within:border-indigo-500'
          }`}
        >
          <MapPin className="w-5 h-5 mr-3 text-indigo-500" />
          <input
            type="text"
            placeholder="Ex: Hotel Copacabana Palace"
            value={connDestination}
            onChange={(e) => setConnDestination(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-sm font-medium"
          />
        </div>
      </div>

      {/* PONTOS DE CONEXÃO */}
      <div className="space-y-4">
        {connPoints.map((val, idx) => (
          <div key={idx}>
            <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
              Ponto {idx + 1}
            </label>

            <div
              className={`flex items-center px-3 py-2 rounded-lg border transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 focus-within:border-indigo-500'
                  : 'bg-gray-50 border-gray-200 focus-within:border-indigo-500'
              }`}
            >
              <Network className="w-5 h-5 mr-3 text-blue-500" />

              <input
                type="text"
                placeholder="Ponto a ser verificado"
                value={val}
                onChange={(e) => updateConn(idx, e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm font-medium"
              />

              {connPoints.length > 1 && (
                <button
                  onClick={() => removeConn(idx)}
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
        onClick={addConn}
        className="mt-4 w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
      >
        + Adicionar ponto
      </button>
    </div>

  )
}

export default ComponenteConexo;