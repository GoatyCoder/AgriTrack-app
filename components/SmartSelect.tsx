import React, { useState, useEffect, useRef } from 'react';
import { Search, X, List, Check } from 'lucide-react';

interface Option {
  id: string;
  codice: string;
  nome: string;
  descrizioneSecondaria?: string;
  [key: string]: any;
}

interface SmartSelectProps<T extends Option> {
  label: string;
  value: string; // The selected ID
  options: T[];
  onSelect: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SmartSelect = <T extends Option>({ 
  label, value, options, onSelect, placeholder = 'Inserisci codice...', disabled = false 
}: SmartSelectProps<T>) => {
  const [inputValue, setInputValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Find selected item to display info
  const selectedItem = options.find(o => o.id === value);

  // Focus ref for modal input
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isModalOpen && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isModalOpen]);

  // Handle "Enter" on the main input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = inputValue.trim().toUpperCase();
      if (!code) return;

      const exactMatches = options.filter(o => o.codice.toUpperCase() === code);
      if (exactMatches.length === 1) {
        onSelect(exactMatches[0].id);
        setInputValue(exactMatches[0].codice);
        return;
      }

      // Nessuna corrispondenza o codice ambiguo: apri dialog di scelta
      setSearchQuery(inputValue);
      setIsModalOpen(true);
    }
  };


  useEffect(() => {
    if (selectedItem) {
      setInputValue(selectedItem.codice);
    }
  }, [selectedItem?.id]);

  const filteredOptions = options.filter(o => {
    const q = searchQuery.toLowerCase();
    return o.nome.toLowerCase().includes(q) || o.codice.toLowerCase().includes(q);
  });

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
      
      <div className="flex gap-2">
        {/* Code Input */}
        <div className="relative w-28 flex-shrink-0">
            <input 
                type="text"
                className={`w-full border rounded-lg p-2 text-sm font-mono uppercase font-bold text-center ${disabled ? 'bg-gray-100' : 'border-gray-300 focus:ring-2 focus:ring-agri-500 outline-none'}`}
                placeholder="COD"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
            />
        </div>

        {/* Display / Trigger */}
        <div 
            className={`flex-1 border rounded-lg p-2 text-sm flex items-center justify-between cursor-pointer ${disabled ? 'bg-gray-100' : 'bg-white hover:bg-gray-50 border-gray-300'}`}
            onClick={() => !disabled && setIsModalOpen(true)}
        >
            {selectedItem ? (
                <span className="font-bold text-gray-800 truncate">{selectedItem.nome} <span className="text-xs text-gray-400 font-normal">({selectedItem.codice})</span></span>
            ) : (
                <span className="text-gray-400 italic">{placeholder}</span>
            )}
            {!disabled && <List size={16} className="text-gray-400" />}
        </div>
      </div>

      {/* SEARCH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h3 className="font-bold text-gray-800">Cerca {label}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-200 rounded"><X size={20}/></button>
                </div>
                
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input 
                            ref={searchInputRef}
                            type="text" 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agri-500 outline-none"
                            placeholder="Cerca per nome o codice..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 p-2">
                    {filteredOptions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Nessun risultato trovato per "{searchQuery}"
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredOptions.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => {
                                        onSelect(opt.id);
                                        setInputValue(opt.codice);
                                        setIsModalOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between hover:bg-agri-50 transition-colors ${opt.id === value ? 'bg-agri-50 border border-agri-200' : ''}`}
                                >
                                    <div>
                                        <div className="font-bold text-gray-800">{opt.nome}</div>
                                        <div className="text-xs text-gray-500 font-mono">Cod: {opt.codice}</div>
                                        {opt.descrizioneSecondaria && <div className="text-xs text-gray-500">{opt.descrizioneSecondaria}</div>}
                                    </div>
                                    {opt.id === value && <Check size={18} className="text-agri-600" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="p-2 border-t border-gray-100 text-center text-xs text-gray-400 bg-gray-50 rounded-b-xl">
                    Premi ESC per chiudere
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SmartSelect;