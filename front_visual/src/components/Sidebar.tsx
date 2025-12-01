import React, { useState } from 'react';
import { RouteData, Theme } from '../types';
import { 
  Moon, 
  Sun, 
  Map as MapIcon,
} from 'lucide-react';

import SecaoCalcularRota from './pages/CalcularRota';
import SecaoPontoEncontro from './pages/PontoEncontro';
import SecaoComponenteConexo from './pages/ComponenteConexo';
import Tabs from './Tabs';

interface SidebarProps {
  onCalculate: (origin: string, dest: string, turno: 'dia'|'noite') => void;
  loading: boolean;
  routeData: RouteData | null;
  theme: Theme;
  onToggleTheme: () => void;
}

type FeatureTab = 'route' | 'meeting' | 'connectivity';

const Sidebar: React.FC<SidebarProps> = ({ 
  loading, 
  theme, 
  onToggleTheme 
}) => {

  const isDark = theme === Theme.NIGHT;

  const [activeTab, setActiveTab] = useState<FeatureTab>('route');
  
  const handleThemeSwitch = () => {
    const nextTurno = isDark ? 'dia' : 'noite';
    onToggleTheme();
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
        
        <Tabs setActiveTab={setActiveTab} activeTab={activeTab} isDark={isDark}/>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">

        {activeTab === 'route' && <SecaoCalcularRota isDark={isDark} loading={loading}/>}

        {activeTab === 'meeting' && <SecaoPontoEncontro isDark={isDark}/>}

        {activeTab === 'connectivity' && <SecaoComponenteConexo isDark={isDark}/>}

      </div>
    </div>
  );
};

export default Sidebar;
