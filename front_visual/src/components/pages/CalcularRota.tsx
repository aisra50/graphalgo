import React, { useState } from 'react';

import { 
  MapPin, 
  Search
} from 'lucide-react';

import { Lugar } from '../../types';

import AutocompleteInput from '../AutoCompleteInput';

interface CalcularRotaProps {
  isDark: boolean;
  loading: boolean;
  lugares: Lugar[];
  setMostraMapa: () => void;
}


function calculaRota(origem: number, destino: number, turno: string, setMostraMapa: (x:boolean) => void)
{
    console.log(JSON.stringify(
            {
                'origem': origem,
                'destino': destino,
                'turno': turno
            }
        ))
    fetch('http://localhost:5000/caminho-minimo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {
                'origem': origem,
                'destino': destino,
                'turno': turno
            }
        )
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`erro HTTP! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Dados recebidos:', data);
        setMostraMapa(false);
        setTimeout(() => setMostraMapa(true), 10);
        
      })
      .catch(error => {
        console.error('Houve um problema ao obter dados de lugares:', error);
        setMostraMapa(false);
      });      
}

const CalcularRota: React.FC<CalcularRotaProps> = ({
    isDark, 
    loading,
    lugares,
    setMostraMapa
}) => {
    const [inputOrigem, setInputOrigem] = useState<string>('');
    const [inputDestino, setInputDestino] = useState<string>('');

    const [origem, setOrigem] = useState<Lugar>(null);
    const [destino, setDestino] = useState<Lugar>(null);


    function getCurrentTurno () {
        return isDark ? 'noite' : 'dia';
    }

    function handleRouteSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!origem?.id || !destino.id) return;

        calculaRota(origem.id, destino.id, getCurrentTurno(), setMostraMapa);
    }

    return (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <form onSubmit={handleRouteSubmit} className="space-y-4">

                {/* ORIGEM */}
                <AutocompleteInput 
                    label="Origem" 
                    textValue={inputOrigem}
                    onUpdateTextValue={setInputOrigem}
                    onUpdateChosenPlace={setOrigem}
                    options={lugares} 
                    placeholder='Ex: Forte de Copacabana' 
                    icon={<MapPin className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`}/>}
                    isDark={isDark}
                    iconColorClass={isDark ? 'text-emerald-400' : 'text-emerald-600'}
                />
                {/* DESTINO */}
                <AutocompleteInput 
                    label="Destino" 
                    textValue={inputDestino}
                    onUpdateTextValue={setInputDestino}
                    onUpdateChosenPlace={setDestino}
                    options={lugares} 
                    placeholder='Ex: Hotel Copacabana Palace' 
                    icon={<MapPin
                    className={`w-5 h-5 mr-3 ${isDark ? 'text-red-400' : 'text-red-600'}`}/>}
                    isDark={isDark}
                    iconColorClass={isDark ? 'text-emerald-400' : 'text-emerald-600'}
                />

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