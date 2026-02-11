import React from 'react';
import { Play, Square, PlusCircle, RefreshCw, Pencil, Pause, Trash2 } from 'lucide-react';
import { SessioneLinea, Articolo, Pedana } from '../types';
import { formatTime } from '../utils';

interface SessionCardProps {
  sessione: SessioneLinea;
  articolo: Articolo;
  siglaLottoCode: string;
  dataIngresso: string;
  pedaneSessione: Pedana[];
  onAddPedana: () => void;
  onCloseSession: () => void;
  onDeleteSession: () => void;
  onChangeLotto: () => void;
  onEditSession: () => void;
  onTogglePause: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ 
  sessione, articolo, siglaLottoCode, dataIngresso, pedaneSessione, onAddPedana, onCloseSession, onDeleteSession, onChangeLotto, onEditSession, onTogglePause 
}) => {
  const totColli = pedaneSessione.reduce((acc, p) => acc + p.numeroColli, 0);
  const totKg = pedaneSessione.reduce((acc, p) => acc + p.pesoTotale, 0);
  const isPaused = sessione.status === 'PAUSA';
  const lastPauseMotivo = isPaused && sessione.pause.length > 0 ? sessione.pause[sessione.pause.length - 1].motivo : null;

  return (
    <div className={`bg-white rounded-xl shadow-md border-l-8 transition-all overflow-hidden relative ${isPaused ? 'border-amber-400 opacity-90' : 'border-agri-500'}`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide ${isPaused ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                {sessione.linea}
              </span>
              <span className="text-gray-400 text-xs flex items-center gap-1">
                {isPaused ? (
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <Pause size={10} fill="currentColor"/> IN PAUSA
                    {lastPauseMotivo && <span className="text-amber-500 font-normal ml-1">({lastPauseMotivo})</span>}
                  </span>
                ) : (
                  <><Play size={10} className="text-agri-500" fill="currentColor" /> In corso: {formatTime(sessione.inizio)}</>
                )}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 leading-tight">{articolo.nome}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Lotto: <span className="font-mono text-gray-700 font-medium">{siglaLottoCode}</span> ({dataIngresso})
            </p>
          </div>
          
          <div className="flex gap-1.5">
            {/* 1. Pausa / Riprendi */}
            <button 
                onClick={onTogglePause}
                className={`p-2 rounded-lg transition-colors ${isPaused ? 'text-agri-600 bg-agri-50 hover:bg-agri-100' : 'text-amber-500 bg-amber-50 hover:bg-amber-100'}`}
                title={isPaused ? "Riprendi Lavorazione" : "Metti in Pausa"}
            >
                {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
            </button>
            
            {/* 2. Chiudi */}
            <button 
                onClick={onCloseSession}
                className="text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                title="Chiudi Sessione"
            >
                <Square size={18} fill="currentColor" />
            </button>

            {/* 3. Cambio Lotto */}
            <button 
                onClick={onChangeLotto}
                className="text-gray-400 hover:text-agri-600 bg-gray-50 hover:bg-agri-50 p-2 rounded-lg transition-colors"
                title="Cambio Lotto (Chiudi e Riapri)"
            >
                <RefreshCw size={18} />
            </button>

            {/* 4. Modifica */}
             <button 
                onClick={onEditSession}
                className="text-gray-400 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 p-2 rounded-lg transition-colors"
                title="Modifica Sessione"
            >
                <Pencil size={18} />
            </button>
            
            {/* 5. Elimina */}
            <button 
                onClick={onDeleteSession}
                className="text-gray-400 hover:text-red-700 bg-gray-50 hover:bg-red-50 p-2 rounded-lg transition-colors"
                title="Elimina Sessione"
            >
                <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-3 gap-3 mb-6 p-3 rounded-lg border transition-colors ${isPaused ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-100'}`}>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase font-semibold">Pedane</p>
            <p className="text-lg font-bold text-gray-800">{pedaneSessione.length}</p>
          </div>
          <div className="text-center border-l border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-semibold">Colli</p>
            <p className="text-lg font-bold text-gray-800">{totColli}</p>
          </div>
          <div className="text-center border-l border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-semibold">Kg Tot</p>
            <p className={`text-lg font-bold ${isPaused ? 'text-amber-700' : 'text-agri-600'}`}>{totKg.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={onAddPedana}
          disabled={isPaused}
          className={`w-full py-3 rounded-xl font-bold shadow-md transform transition-all flex items-center justify-center gap-2 ${isPaused ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-agri-600 active:bg-agri-800 hover:bg-agri-700 text-white hover:shadow-lg active:scale-95'}`}
        >
          <PlusCircle size={22} />
          NUOVA PEDANA
        </button>
      </div>
    </div>
  );
};

export default SessionCard;