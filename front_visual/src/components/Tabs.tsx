import React, { useState } from 'react';

import { 
  Network,
  Navigation,
  Users
} from 'lucide-react';

interface TabsProps {
    setActiveTab: () => void,
    activeTab: string,
    isDark: boolean,
}

const Tabs: React.FC<TabsProps> = ({
    setActiveTab,
    activeTab,
    isDark,
}) => {

    return (
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
    )
}

export default Tabs;