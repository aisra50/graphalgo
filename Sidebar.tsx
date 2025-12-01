import React, { useState } from 'react';
import { RouteData, Theme } from '../types';
import { 
  MapPin, 
  Moon, 
  Sun, 
  Search, 
  Clock, 
  Ruler,
  ArrowRight,
  Map as MapIcon,
  Users,
  Network,
  Navigation
} from 'lucide-react';

interface SidebarProps {
  onCalculate: (origin: string, dest: string, turno: 'dia'|'noite') => void;
  loading: boolean;
  routeData: RouteData | null;
  theme: Theme;
  onToggleTheme: () => void;
}

type FeatureTab = 'route' | 'meeting' | 'connectivity';

const Sidebar: React.FC<SidebarProps> = ({ 
  onCalculate, 
  loading, 
  routeData, 
  theme, 
  onToggleTheme 
}) => {

  const isDark = theme === Theme.NIGHT;

  const [activeTab, setActiveTab] = useState<FeatureTab>('route');
  
  // Route State
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  
  // Meeting Point State
  const [friendsLocations, setFriendsLocations] = useState<string[]>(['', '']);

  // Connectivity State
  const [connDestination, setConnDestination] = useState('');
  const [connPoints, setConnPoints] = useState<string[]>(['', '']);

  // Handlers for dynamic inputs (amigos/conexão)!!!
  const addFriend = () => setFriendsLocations([...friendsLocations, '']);
  const removeFriend = (i: number) =>
    friendsLocations.length > 2 &&
    setFriendsLocations(friendsLocations.filter((_, idx) => idx !== i));
  const updateFriend = (i: number, value: string) => {
    const list = [...friendsLocations];
    list[i] = value;
    setFriendsLocations(list);
  };

  const addConn = () => setConnPoints([...connPoints, '']);
  const removeConn = (i: number) =>
    connPoints.length > 1 && setConnPoints(connPoints.filter((_, idx) => idx !== i));
  const updateConn = (i: number, value: string) => {
    const list = [...connPoints];
    list[i] = value;
    setConnPoints(list);
  };

  // Lance do turno com o tema
  const getCurrentTurno = (): 'dia' | 'noite' =>
    isDark ? 'noite' : 'dia';

  const handleThemeSwitch = () => {
    const nextTurno = isDark ? 'dia' : 'noite';
    onToggleTheme();

    if (origin.trim() && destination.trim() && activeTab === 'route') {
      onCalculate(origin, destination, nextTurno);
    }
  };

  const handleRouteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;

    onCalculate(origin, destination, getCurrentTurno());
  };

  return (
    <div
      className={`flex flex-col h-full w-full md:w-[400px] shadow-2xl transition-colors duration-300 z-20 relative ${
        isDark
          ? 'bg-slate-900 text-slate-100 border-r border-slate-800'
          : 'bg-white text-gray-800 border-r border-gray-200'
      }`}
    >
      {/* HEADER */}
      <div className={`p-6 pb-0 ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <MapIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">GraphToGo</h1>
          </div>

          <button
            onClick={handleThemeSwitch}
            className={`p-2 rounded-full transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400'
                : 'bg-gray-100 hover:bg-gray-200 text-orange-500'
            }`}
            title={isDark ? 'Mudar para modo diurno' : 'Mudar para modo noturno'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* TABS */}
        <div className={`flex p-1 rounded-xl mb-6 ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}>
          <button
            onClick={() => setActiveTab('route')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'route'
                ? isDark
                  ? 'bg-slate-700 text-white shadow'
                  : 'bg-white text-indigo-600 shadow'
                : 'text-gray-400 hover:text-gray-500'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            Rota
          </button>

          <button
            onClick={() => setActiveTab('meeting')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'meeting'
                ? isDark
                  ? 'bg-slate-700 text-white shadow'
                  : 'bg-white text-indigo-600 shadow'
                : 'text-gray-400 hover:text-gray-500'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Encontro
          </button>

          <button
            onClick={() => setActiveTab('connectivity')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'connectivity'
                ? isDark
                  ? 'bg-slate-700 text-white shadow'
                  : 'bg-white text-indigo-600 shadow'
                : 'text-gray-400 hover:text-gray-500'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Conexão
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">

        {/* ======================== ROUTE TAB ======================== */}
        {activeTab === 'route' && (
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
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
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
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Ex: Hotel Copacabana Palace"
                    disabled={loading}
                    className="bg-transparent border-none outline-none w-full text-sm font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !origin || !destination}
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

            {/* RESULTADO */}
            {routeData && (
              <div className="mt-8 pt-6 border-t border-dashed border-gray-200 dark:border-slate-800 animate-in fade-in duration-500">

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div
                    className={`p-4 rounded-xl border ${
                      isDark
                        ? 'bg-slate-800/50 border-slate-700'
                        : 'bg-indigo-50 border-indigo-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 opacity-70">
                      <Ruler className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase">
                        Distância
                      </span>
                    </div>
                    <p className="text-lg font-bold">{routeData.totalDistance}</p>
                  </div>

                  <div
                    className={`p-4 rounded-xl border ${
                      isDark
                        ? 'bg-slate-800/50 border-slate-700'
                        : 'bg-indigo-50 border-indigo-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 opacity-70">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase">
                        Tempo
                      </span>
                    </div>
                    <p className="text-lg font-bold">{routeData.estimatedDuration}</p>
                  </div>
                </div>

                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 opacity-80 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Passo a Passo
                </h3>

                <div className="space-y-4 relative">
                  <div
                    className={`absolute left-3 top-2 bottom-2 w-0.5 ${
                      isDark ? 'bg-slate-700' : 'bg-gray-200'
                    }`}
                  />

                  {routeData.steps.map((step, idx) => (
                    <div key={idx} className="relative pl-8 group">
                      <div
                        className={`
                          absolute left-[0.4rem] top-1.5 w-3 h-3 rounded-full border-2
                          transition-colors
                          ${
                            isDark
                              ? 'bg-slate-900 border-indigo-500 group-hover:bg-indigo-500'
                              : 'bg-white border-indigo-600 group-hover:bg-indigo-600'
                          }
                        `}
                      />

                      <div
                        className={`p-3 rounded-lg text-sm transition-colors ${
                          isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
                        }`}
                      >
                        <p className="leading-relaxed">{step.instruction}</p>

                        {step.distance && (
                          <span
                            className={`text-xs font-medium mt-1 block ${
                              isDark ? 'text-slate-400' : 'text-gray-500'
                            }`}
                          >
                            {step.distance}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================== MEETING TAB ======================== */}
        {activeTab === 'meeting' && (
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
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-sm font-medium"
                />
              </div>
            </div>

            {/* AMIGOS (vários campos dinâmicos) */}
            <div className="space-y-4">
              {friendsLocations.map((val, idx) => (
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
                      onChange={(e) => updateFriend(idx, e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-sm font-medium"
                    />

                    {friendsLocations.length > 2 && (
                      <button
                        onClick={() => removeFriend(idx)}
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
              onClick={addFriend}
              className="mt-4 w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
            >
              + Adicionar amigo
            </button>
          </div>
        )}


        {/* ======================== CONNECTIVITY TAB ======================== */}
        {activeTab === 'connectivity' && (
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
        )}

      </div>
    </div>
  );
};

export default Sidebar;
