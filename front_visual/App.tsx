import React, { useState, useCallback } from 'react';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import { RouteData, Theme } from './types';
import { calculateRoute } from './services/geminiService';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.DAY);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTheme = () => {
    setTheme((prev) => (prev === Theme.DAY ? Theme.NIGHT : Theme.DAY));
  };

  // Integrando com a questão do turno
  const handleCalculateRoute = useCallback(async (origin: string, destination: string, turno: 'dia' | 'noite') => {
    setLoading(true);
    setError(null);
    try {

      // Repassa o turno para o back
      const data = await calculateRoute(origin, destination, turno);
      setRouteData(data);
    } catch (err) {
      console.error("Failed to fetch route:", err);
      setError("Não foi possível calcular a rota.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className={`flex flex-col md:flex-row h-screen w-screen overflow-hidden transition-colors duration-300 ${
      theme === Theme.NIGHT ? 'bg-slate-950' : 'bg-gray-100'
    }`}>
      
      {/* Sidebar Wrapper */}
      <div className="h-1/2 md:h-full w-full md:w-auto z-20 flex-shrink-0 order-2 md:order-1">
        <Sidebar 
          onCalculate={handleCalculateRoute} 
          loading={loading}
          routeData={routeData}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </div>

      {/* Map Area */}
      <div className="h-1/2 md:h-full flex-1 relative z-10 order-1 md:order-2">
        <Map routeData={routeData} theme={theme} />
        
        {/* Error Toast */}
        {error && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[2000] bg-red-500 text-white px-6 py-3 rounded-full shadow-xl font-medium text-sm animate-bounce">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
