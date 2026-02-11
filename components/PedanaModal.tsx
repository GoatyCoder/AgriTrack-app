import React, { useState, useEffect } from 'react';
import { X, Printer, Package } from 'lucide-react';
import { Articolo, SessioneLinea, Pedana, Imballo } from '../types';
import { generateStickerCode } from '../utils';
import SmartSelect from './SmartSelect';

interface PedanaModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessione: SessioneLinea;
  articolo: Articolo;
  imballiOptions: Imballo[];
  calibriOptions?: string[]; 
  pedaneTodayCount: number;
  onSave: (pedana: Omit<Pedana, 'id' | 'timestamp'>) => void;
}

const PedanaModal: React.FC<PedanaModalProps> = ({ 
  isOpen, onClose, sessione, articolo, imballiOptions = [], calibriOptions = [], pedaneTodayCount, onSave 
}) => {
  const [numeroColli, setNumeroColli] = useState<number>(72);
  const [imballoId, setImballoId] = useState<string>('');
  const [calibro, setCalibro] = useState<string>('');
  const [pesoManuale, setPesoManuale] = useState<number>(0);
  const [stickerPreview, setStickerPreview] = useState<string>('');
  const [showSticker, setShowSticker] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStickerPreview(generateStickerCode(pedaneTodayCount));
      setShowSticker(false);
      setNumeroColli(72);
      setPesoManuale(0);
      setImballoId(imballiOptions[0]?.id || '');
      setCalibro(calibriOptions[0] || ''); 
    }
  }, [isOpen, pedaneTodayCount, imballiOptions, calibriOptions]);

  const pesoTeorico = articolo.tipoPeso === 'EGALIZZATO' 
    ? numeroColli * articolo.pesoColloTeorico
    : pesoManuale > 0 ? pesoManuale : numeroColli * articolo.pesoColloTeorico;

  const handleSave = () => {
    const imballoObj = imballiOptions.find(i => i.id === imballoId);
    onSave({
      sessioneId: sessione.id,
      stickerCode: stickerPreview,
      numeroColli,
      pesoTotale: pesoTeorico,
      imballo: imballoObj?.nome || 'N/D', // Save name for sticker history
      calibro
    });
    setShowSticker(true);
  };

  const handleCloseComplete = () => {
    setShowSticker(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-agri-600 px-6 py-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Package size={20} />
            {showSticker ? 'Sticker Generato' : 'Nuova Pedana'}
          </h3>
          <button onClick={onClose} className="hover:bg-agri-700 p-1 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showSticker ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                 <p><span className="font-semibold text-gray-600">Sessione:</span> {sessione.linea}</p>
                 <p><span className="font-semibold text-gray-600">Articolo:</span> {articolo.nome}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numero Colli</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setNumeroColli(Math.max(1, numeroColli - 1))} className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center font-bold text-xl">-</button>
                  <input 
                    type="number" 
                    value={numeroColli}
                    onChange={(e) => setNumeroColli(parseInt(e.target.value) || 0)}
                    className="flex-1 border-gray-300 border rounded-lg p-2 text-center font-bold text-lg"
                  />
                  <button onClick={() => setNumeroColli(numeroColli + 1)} className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center font-bold text-xl">+</button>
                </div>
              </div>

              <div>
                 <SmartSelect 
                    label="Imballaggio"
                    options={imballiOptions}
                    value={imballoId}
                    onSelect={setImballoId}
                    placeholder="Codice Imballo..."
                 />
              </div>

              {calibriOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calibro</label>
                  <select 
                      value={calibro}
                      onChange={(e) => setCalibro(e.target.value)}
                      className="w-full border-gray-300 border rounded-lg p-2"
                  >
                      {calibriOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {articolo.tipoPeso === 'USCENTE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Peso Netto Totale (Kg)</label>
                    <input 
                        type="number" 
                        value={pesoManuale}
                        onChange={(e) => setPesoManuale(parseFloat(e.target.value) || 0)}
                        className="w-full border-gray-300 border rounded-lg p-2 font-bold"
                        placeholder="Inserisci peso bilancia..."
                    />
                  </div>
              )}

              <div className="pt-2">
                  <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">Peso Stimato:</span>
                      <span className="font-bold">{pesoTeorico.toFixed(2)} Kg</span>
                  </div>
                  <button 
                    onClick={handleSave}
                    className="w-full bg-agri-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-agri-700 transition-colors"
                  >
                    Conferma e Stampa
                  </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6">
                <div className="bg-white border-2 border-black p-4 w-64 mb-6 shadow-sm">
                    <div className="text-center border-b-2 border-black pb-2 mb-2">
                        <h4 className="font-bold text-xl">{sessione.linea}</h4>
                        <p className="text-xs">{new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="text-center mb-2">
                         <h2 className="text-3xl font-black">{stickerPreview}</h2>
                    </div>
                    <div className="text-xs space-y-1">
                        <p><strong>ART:</strong> {articolo.nome}</p>
                        <p><strong>COLLI:</strong> {numeroColli}</p>
                        <p><strong>PESO:</strong> {pesoTeorico.toFixed(1)} Kg</p>
                        <p><strong>CAL:</strong> {calibro}</p>
                    </div>
                </div>

                <div className="flex gap-3 w-full">
                     <button 
                        onClick={handleCloseComplete}
                        className="flex-1 bg-gray-100 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-200"
                     >
                        Chiudi
                     </button>
                     <button 
                        onClick={() => window.print()}
                        className="flex-1 bg-agri-600 text-white font-bold py-3 rounded-xl hover:bg-agri-700 flex items-center justify-center gap-2"
                     >
                        <Printer size={20} /> Stampa
                     </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PedanaModal;