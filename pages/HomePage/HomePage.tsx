import React from 'react';
import { Factory, FileText, PlayCircle, Settings } from 'lucide-react';

interface HomePageProps {
  onStartTurno: () => void;
  onGoReport: () => void;
  onGoSettings: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStartTurno, onGoReport, onGoSettings }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <div className="bg-agri-600 p-4 rounded-2xl shadow-xl mb-6"><Factory size={48} className="text-white" /></div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">AgriTrack</h1>
          <p className="text-gray-500 mt-2">Sistema Gestione Produzione e Tracciabilità</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <button onClick={onStartTurno} className="w-full flex items-center justify-center gap-3 bg-agri-600 hover:bg-agri-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95">
            <PlayCircle size={24} /> INIZIA TURNO
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={onGoReport} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 font-bold gap-2">
              <FileText size={24} className="text-agri-600" /> Report
            </button>
            <button onClick={onGoSettings} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 font-bold gap-2">
              <Settings size={24} className="text-agri-600" /> Anagrafiche
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-8">AgriTrack Production Management System</p>
      </div>
    </div>
  );
};
