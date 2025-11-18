import { useState } from "react";

type par_nomelugar_id = {
  nome_lugar: string;
  id: number;
};

interface AutocompleteProps {
  placeholder: string;
  valores_possiveis: par_nomelugar_id[];
  onselect: (value: number | null) => void;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ placeholder, valores_possiveis, onselect}) => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const data = valores_possiveis;

  function get_id_from_nome_lugar(nome_lugar: string) : number | null{
    let id_escolhido: number | null = null;

    for (let valor of valores_possiveis) {
      if (valor.nome_lugar == nome_lugar) {
        id_escolhido = valor.id;
      }
    }

    return id_escolhido;
  }

  function handleChange(evento:React.ChangeEvent<HTMLInputElement>) {
    const lugar_escolhido = evento.target.value;

    setQuery(lugar_escolhido);

    let id_escolhido = get_id_from_nome_lugar(lugar_escolhido);
    if (id_escolhido != null)
      onselect(id_escolhido);

    if (lugar_escolhido.trim() === "") {
      setResults(valores_possiveis.map(x => x.nome_lugar));
      setIsOpen(true);
      return;
    }

    const filtered = data.filter((item) =>
      item.nome_lugar.toLowerCase().includes(lugar_escolhido.toLowerCase())
    ).map(x => x.nome_lugar);

    setResults(filtered);
    setIsOpen(true);
  }

  function handleSelect(value:string) {
    setQuery(value);

    let id_escolhido = get_id_from_nome_lugar(value);
    if (id_escolhido != null)
      onselect(id_escolhido);

    setIsOpen(false);
  }

  return (
    <div style={{ width: "100%", maxWidth: "400px", margin: "40px auto" }}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "12px 14px",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      />

      {isOpen && results.length > 0 && (
        <div
          style={{
            marginTop: "4px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            background: "white",
            overflow: "hidden",
          }}
        >
          {results.map((item) => (
            <div
              key={item}
              onClick={() => handleSelect(item)}
              style={{
                padding: "12px 14px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Autocomplete;
