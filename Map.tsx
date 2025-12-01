import React from 'react';
import { RouteData, Theme } from '../types';
import { Map as MapIcon } from 'lucide-react';

//Mock visual do mapa até o sistema de mapa real ser implementado
interface MapProps {
  routeData: RouteData | null;
  theme: Theme;
}

const Map: React.FC<MapProps> = ({ routeData, theme }) => {
  const isDark = theme === Theme.NIGHT;

  return (
    <div
      className={`h-full w-full flex items-center justify-center p-8 transition-colors duration-300 ${
        isDark ? 'bg-slate-950' : 'bg-gray-100'
      }`}
    >
      <div
        className={`
          w-full max-w-sm aspect-[9/19.5] rounded-3xl border-4 shadow-2xl
          flex flex-col items-center justify-center text-center p-6 relative overflow-hidden
          transition-all duration-500
          ${isDark
            ? 'border-slate-800 bg-slate-900/40 text-slate-400 shadow-slate-900/50'
            : 'border-gray-300 bg-gray-200/50 text-gray-500 shadow-gray-300/50'
          }
        `}
      >

        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <div
            className={`w-80 h-80 rounded-full blur-3xl ${
              isDark ? 'bg-indigo-600' : 'bg-blue-400'
            }`}
          />
        </div>

        <MapIcon className="w-16 h-16 mb-3 opacity-40" />

        <h3 className="text-lg font-bold mb-1 opacity-80">
          Área do Mapa
        </h3>

        <p className="text-sm opacity-60 max-w-[220px] leading-relaxed">
          Um mapa real será renderizado aqui em breve. Por enquanto, esta é apenas a área visual.
        </p>

        {routeData && (
          <div
            className={`
              mt-8 px-4 py-2 rounded-lg border text-xs font-mono
              ${isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white/90 border-gray-300'}
            `}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="truncate max-w-[160px]">
                {routeData.origin.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="truncate max-w-[160px]">
                {routeData.destination.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;
