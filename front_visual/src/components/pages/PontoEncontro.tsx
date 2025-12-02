import React, { useState } from 'react';
import { Lugar } from '../../types';
import AutoCompleteInput from '../AutoCompleteInput';

import { 
  MapPin, 
  Users,
} from 'lucide-react';

interface PontoEncontroProps {
    isDark: boolean,
    lugares: Lugar[],
    setMostraMapa: () => void
}


const PontoEncontro: React.FC<PontoEncontroProps> = ({
    isDark,
    lugares,
    setMostraMapa
}) => {
    const [lugaresAmigosInput, setLugaresAmigosInput] = useState<string[]>(['', '']);
    const [lugaresAmigos, setLugaresAmigos] = useState<Lugar[]>([null, null]);

    function handleEncontroSubmit () {
        if (lugaresAmigos.some(x => x == null)) {
            console.error('Endereço de amigo inválido');
            return;
        }

        const request = JSON.stringify({ 'casas-amigos': [...lugaresAmigos.map(x => x.id)] });
        console.log(request)

        fetch('http://localhost:5000/ponto-encontro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                {
                    'casas-amigos': [...lugaresAmigos.map(x => x.id)]
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
    
    const adicionaAmigo = () => {
        setLugaresAmigosInput([...lugaresAmigosInput, ''])
        setLugaresAmigos([... lugaresAmigos, null])
    };
    const removeAmigo = (i: number) => {
        if (lugaresAmigosInput.length > 2) {
            setLugaresAmigosInput(lugaresAmigosInput.filter((_, idx) => idx !== i));
            setLugaresAmigos(lugaresAmigos.filter((_, idx) => idx !== i));
        }
    }

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

        {/* AMIGOS (vários campos dinâmicos) */}
        <div className="space-y-4">
            {lugaresAmigosInput.map((val, idx) => (
            <div key={idx}>
                <AutoCompleteInput
                    label={`Amigo ${idx + 1}`}
                    textValue={lugaresAmigosInput[idx]}
                    onUpdateTextValue={(str) => setLugaresAmigosInput(prev => prev.map((value, index) => index === idx ? str : value))}
                    onUpdateChosenPlace={(opt) => setLugaresAmigos(prev => prev.map((value, index) => index === idx ? opt : value))}
                    options={lugares}
                    placeholder='Endereço do amigo'
                    icon={<Users className="w-5 h-5 mr-3 text-emerald-500" />}
                    disabled={false}
                    isDark={isDark}
                    iconColorClass={isDark ? 'text-indigo-400' : 'text-indigo-600'}
                >
                {lugaresAmigosInput.length > 2 && (
                    <button
                    onClick={() => removeAmigo(idx)}
                    type="button"
                    className="ml-2 text-red-500 text-xs font-bold"
                    >
                    X
                    </button>
                )}
              </AutoCompleteInput>
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
         <button
            type="button"
            onClick={handleEncontroSubmit}
            className="mt-4 w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
        >
            Buscar ponto de encontro
        </button>
        </div>
    )
}

export default PontoEncontro;