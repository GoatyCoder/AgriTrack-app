import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Scarto, SiglaLotto } from '../types';

interface ScartoModalProps {
  isOpen: boolean;
  onClose: () => void;
  turnoId: string;
  sigleLotto: SiglaLotto[]; 
  tipologieOptions: string[];
  onSave: (scarto: Omit<Scarto, 'id' | 'timestamp'>) => void;
}

const ScartoModal: React.FC<ScartoModalProps> = ({ 
  isOpen, onClose, turnoId, sigleLotto, tipologieOptions, onSave 
}) => {
  const [siglaLottoId, setSiglaLottoId] = useState<string>(sigleLotto[0]?.id || '');
  const [dataIngresso, setDataIngresso] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tipologia, setTipologia] = useState<string>(tipologieOptions[0] || 'Scarto');
  const [peso, setPeso] = useState<number>(0);

  if (!isOpen) return null;

  const handleSave = () => {
    if (peso <= 0 || !siglaLottoId) return;
    onSave({
      turnoId,
      siglaLottoId,
      dataIngresso,
      tipologia,
      peso
    });
    setPeso(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-red-600 px-6 py-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Trash2 size={20} /> Registra Scarto
          </h3>
          <button onClick={onClose} className="hover:bg-red-700 p-1 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sigla Lotto</label>
            <select 
              className="w-full border-gray-300 border rounded-lg p-2"
              value={siglaLottoId}
              onChange={(e) => setSiglaLottoId(e.target.value)}
            >
              {sigleLotto.map(sl => (
                <option key={sl.id} value={sl.id}>
                  {sl.code} - {sl.produttore}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Ingresso Lotto</label>
            <input 
              type="date"
              className="w-full border-gray-300 border rounded-lg p-2"
              value={dataIngresso}
              onChange={(e) => setDataIngresso(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipologia Scarto</label>
            <select 
              className="w-full border-gray-300 border rounded-lg p-2"
              value={tipologia}
              onChange={(e) => setTipologia(e.target.value)}
            >
              {tipologieOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso (Kg)</label>
            <input 
              type="number" 
              className="w-full border-gray-300 border rounded-lg p-2 font-bold text-lg"
              value={peso}
              onChange={(e) => setPeso(parseFloat(e.target.value) || 0)}
              placeholder="0.0"
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={peso <= 0}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3 rounded-xl shadow-md transition-colors mt-4"
          >
            Salva Scarto
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScartoModal;