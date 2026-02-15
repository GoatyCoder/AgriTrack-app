import React, { useState, useEffect } from 'react';
import { X, Printer, Package } from 'lucide-react';
import { Articolo, Lavorazione, Pedana, Imballo } from '../types';
import { generateStickerData } from '../utils';
import SmartSelect from './SmartSelect';

interface PedanaModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessione: Lavorazione;
  sessioneLabel: string;
  lottoCode: string;
  articolo: Articolo;
  imballiOptions: Imballo[];
  calibriOptions?: string[];
  pedaneTodayCount: number;
  onSave: (pedana: Omit<Pedana, 'id' | 'timestamp'>) => void;
}

const PedanaModal: React.FC<PedanaModalProps> = ({
  isOpen, onClose, sessione, sessioneLabel, lottoCode, articolo, imballiOptions = [], calibriOptions = [], pedaneTodayCount, onSave
}) => {
  const [numeroColli, setNumeroColli] = useState<number>(72);
  const [imballoId, setImballoId] = useState<string>('');
  const [calibro, setCalibro] = useState<string>('');
  const [pesoManuale, setPesoManuale] = useState<number>(0);
  const [stickerPreview, setStickerPreview] = useState('');
  const [doy, setDoy] = useState(0);
  const [seq, setSeq] = useState(0);
  const [showSticker, setShowSticker] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stickerData = generateStickerData(pedaneTodayCount);
      setStickerPreview(stickerData.stickerCode);
      setDoy(stickerData.doy);
      setSeq(stickerData.seq);
      setShowSticker(false);
      setNumeroColli(72);
      setPesoManuale(0);
      setImballoId(imballiOptions[0]?.id || '');
      setCalibro(calibriOptions[0] || '');
    }
  }, [isOpen, pedaneTodayCount, imballiOptions, calibriOptions]);

  const pesoTeorico = pesoManuale > 0 ? pesoManuale : numeroColli * articolo.pesoColloTeorico;

  const handleSave = () => {
    const imballoObj = imballiOptions.find(i => i.id === imballoId);
    onSave({
      sessioneId: sessione.id,
      stickerCode: stickerPreview,
      doy,
      seq,
      numeroColli,
      pesoTotale: pesoTeorico,
      imballoId,
      snapshotImballo: imballoObj ? { codice: imballoObj.codice, nome: imballoObj.nome } : undefined,
      snapshotArticolo: { id: articolo.id, nome: articolo.nome, codice: articolo.codice },
      snapshotIngresso: { siglaLottoId: sessione.siglaLottoId, lottoCode, dataIngresso: sessione.dataIngresso },
      calibro
    });
    setShowSticker(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-agri-600 px-6 py-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg flex items-center gap-2"><Package size={20} />{showSticker ? 'Sticker Generato' : 'Nuova Pedana'}</h3>
          <button onClick={onClose} className="hover:bg-agri-700 p-1 rounded"><X size={20} /></button>
        </div>

        <div className="p-6">
          {!showSticker ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                 <p><span className="font-semibold text-gray-600">Sessione:</span> {sessioneLabel}</p>
                 <p><span className="font-semibold text-gray-600">Articolo:</span> {articolo.nome}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numero Colli</label>
                <input type="number" value={numeroColli} onChange={(e) => setNumeroColli(parseInt(e.target.value) || 0)} className="w-full border-gray-300 border rounded-lg p-2 text-center font-bold text-lg" />
              </div>

              <SmartSelect label="Imballaggio" options={imballiOptions} value={imballoId} onSelect={setImballoId} placeholder="Codice Imballo..." />

              {calibriOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calibro</label>
                  <select value={calibro} onChange={(e) => setCalibro(e.target.value)} className="w-full border-gray-300 border rounded-lg p-2">
                      {calibriOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peso Netto Totale (Kg) - opzionale</label>
                <input type="number" value={pesoManuale} onChange={(e) => setPesoManuale(parseFloat(e.target.value) || 0)} className="w-full border-gray-300 border rounded-lg p-2 font-bold" placeholder="Lascia 0 per peso teorico" />
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Peso Stimato:</span><span className="font-bold">{pesoTeorico.toFixed(2)} Kg</span></div>
                <button onClick={handleSave} className="w-full bg-agri-600 hover:bg-agri-700 text-white font-bold py-3 rounded-xl">Salva Pedana</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-500">Sticker pronto per stampa</p>
              <div className="border rounded-xl p-4">
                <p className="font-mono font-bold text-xl">{stickerPreview}</p>
              </div>
              <button onClick={onClose} className="w-full bg-gray-900 text-white py-2 rounded-lg flex items-center justify-center gap-2"><Printer size={16} />Chiudi</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PedanaModal;
