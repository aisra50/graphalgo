import { useState } from "react";

export default function Autocomplete() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const data = [
    "Spoleto Culinária Italiana, Centro",
    "Spoleto, Nova Iguaçu",
    "Spoleto - Culinária Para Todos, Centro",
    "Spoleto Otica, Copacabana",
  ];

  function handleChange(e:React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    if (value.trim() === "") {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const filtered = data.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase())
    );

    setResults(filtered);
    setIsOpen(true);
  }

  function handleSelect(value:string) {
    setQuery(value);
    setIsOpen(false);
  }

  return (
    <div style={{ width: "100%", maxWidth: "400px", margin: "40px auto" }}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Pesquise qualquer lugar em Rio de Janeiro e Região"
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
