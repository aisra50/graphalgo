import React, { useState, useRef, useEffect } from 'react';
import { Lugar } from '../types';
import { text } from 'stream/consumers';
interface AutocompleteProps {
  label: string;
  textValue: string;
  onUpdateTextValue: () => void;
  onUpdateChosenPlace: () => void;
  options: Lugar[];
  placeholder: string;
  icon: React.ReactNode;
  disabled: boolean;
  isDark: boolean;
  iconColorClass: string;
}

const AutocompleteInput: React.FC<AutocompleteProps> = ({
  label,
  textValue,
  onUpdateTextValue,
  onUpdateChosenPlace,
  options,
  placeholder,
  icon,
  disabled,
  isDark,
  iconColorClass,
  children
}) => {
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>(options.map(op => op.nome));

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: Lugar) => {
    console.log('selecionado;', option);
    onUpdateChosenPlace(option);
    onUpdateTextValue(option.nome);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const newInput = e.target.value;
    onUpdateTextValue(newInput);
  
    const filteredOptions = options.filter(opt => opt.nome.toLowerCase().includes(newInput.toLowerCase()));

    setSuggestions(filteredOptions);
    setShowSuggestions(true);
  };

  return (
    <div className="space-y-2 relative" ref={wrapperRef}>
      <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
        {label}
      </label>
      <div
        className={`flex items-center px-3 py-2 rounded-lg border transition-all ${
          isDark
            ? 'bg-slate-800 border-slate-700 focus-within:border-indigo-500'
            : 'bg-gray-50 border-gray-200 focus-within:border-indigo-500'
        }`}
      >
        <div className={`mr-3 ${iconColorClass}`}>
          {icon}
        </div>
        <input
          type="text"
          value={textValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="bg-transparent border-none outline-none w-full text-sm font-medium"
        />
        {children}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && textValue && suggestions.length > 0 && (
        <ul className={`absolute z-50 w-full mt-1 max-h-48 overflow-y-auto rounded-lg shadow-xl border ${
          isDark 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-gray-200'
        }`}>
          {suggestions.map((option) => (
            <li
              key={option.id}
              onClick={() => handleSelect(option)}
              className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                isDark 
                  ? 'hover:bg-slate-700 text-slate-200' 
                  : 'hover:bg-indigo-50 text-gray-700'
              }`}
            >
              {option.nome}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;