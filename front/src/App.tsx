import './App.css'
import { useState } from 'react';

import Autocomplete from './components/Autocomplete'
import mapaCopa from './assets/copacabana.png';

function App() {
  const [imgUrl, setImgUrl] = useState<string>(mapaCopa);

  function pedir_caminho_minimo(origem: number | null, destino: number | null) {
    if (origem == null || destino == null) {
      console.log("Erro! Destino ou origem inválidos");
    }

    fetch(`localhost:5001/teste?origem=${origem}&destino=${destino}`)
    .then(res=>{return res.blob()})
    .then(blob=>{
      var img = URL.createObjectURL(blob);
      setImgUrl(img)
    })
  }

  let valores = [
    { nome_lugar: "Praça Demétrio Ribeiro", id: 69 },
    { nome_lugar: "Mc Donalds Avenida Princesa Isabel", id: 158 },
    { nome_lugar: "Borogobar", id: 184 },
    { nome_lugar: "Restaurante La Maison", id: 18 }
  ];
  
  const [origem, setOrigem] = useState<number | null>(null);
  const [destino, setDestino] = useState<number | null>(null);

  return (
    <div id="content">
      <div id="mapa">
        <img src={imgUrl} alt="Mapa de Copacabana" id="foto_mapa"/>
      </div>
      <div id="input">
        <Autocomplete placeholder="Origem" valores_possiveis={valores} onselect={setOrigem}/>
        <Autocomplete placeholder="Destino" valores_possiveis={valores} onselect={setDestino}/>
        <button onClick={() => pedir_caminho_minimo(origem, destino)}>Enviar</button>
      </div>
    </div>
  )
}

export default App
