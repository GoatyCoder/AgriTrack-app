import React, { useState, useEffect } from 'react';
import { MOTIVI_PAUSA } from './constants';
import { AppRoutes } from './app/routes';
import PedanaModal from './components/PedanaModal';
import ScartoModal from './components/ScartoModal';
import SmartSelect from './components/SmartSelect';
import { LayoutDashboard, Factory, LogOut, FileText, Settings, RefreshCw, X, AlertTriangle, CheckSquare, Square, Pause } from 'lucide-react';
import { useDialog } from './components/DialogContext';
import { formatTime, updateIsoTime } from './utils';
import { useAppStateStore } from './hooks/useAppStateStore';
import { useSessionFilters } from './hooks/useSessionFilters';
import { useSessionForm } from './hooks/useSessionForm';
import { useTurnoActions } from './hooks/useTurnoActions';
import { useSessioneActions } from './hooks/useSessioneActions';
import { useProductionRecords } from './hooks/useProductionRecords';
import { MonitorPage } from './pages/MonitorPage';


const App: React.FC = () => {
  const { showAlert, showConfirm } = useDialog();

  // --- State ---
  const [view, setView] = useState<'HOME' | 'MONITOR' | 'REPORT' | 'SETTINGS'>('HOME');
  const { state, setState, loadError, clearLoadError } = useAppStateStore();
  
  const [activeTurnoId, setActiveTurnoId] = useState<string | null>(null);
  
  // Modal States
  const [isPedanaModalOpen, setIsPedanaModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isScartoModalOpen, setIsScartoModalOpen] = useState(false);
  const [pausingTarget, setPausingTarget] = useState<{ type: 'SHIFT' | 'SESSION', id: string } | null>(null);

  useEffect(() => {
    if (!loadError) return;
    showAlert({ title: 'Errore archiviazione locale', message: loadError, variant: 'DANGER' });
    clearLoadError();
  }, [loadError, showAlert, clearLoadError]);

  // Restore active turno on load
  useEffect(() => {
    const active = state.turni.find(t => t.status === 'APERTO' || t.status === 'PAUSA');
    if (active) {
        setActiveTurnoId(active.id);
        setView('MONITOR');
    }
  }, []);

  // --- Computed ---
  const getAreaNome = (areaId: string) => state.aree.find(a => a.id === areaId)?.nome || 'Area N/D';
  const getLineaNome = (lineaId: string) => state.linee.find(l => l.id === lineaId)?.nome || 'Linea N/D';

  const activeSessions = state.sessioni.filter(s => s.turnoId === activeTurnoId && s.status !== 'CHIUSA');

  const { activeTurno, handleStartTurno, handleTogglePauseTurno, handleCloseTurno } = useTurnoActions({
    state,
    setState,
    activeTurnoId,
    setActiveTurnoId,
    setView,
    showConfirm,
    setPausingTarget
  });

  const {
    pendingSession,
    conflictingSessions,
    selectedConflictsToClose,
    toggleConflictSelection,
    executeStartSession,
    handleStartSession,
    handleTogglePauseSession,
    handleCloseSession,
    handleDeleteSession,
    isEditSessionMode,
    setIsEditSessionMode,
    editingSession,
    editSessionData,
    setEditSessionData,
    handleEditSession,
    handleSaveEditSession,
    editingCell,
    setEditingCell,
    sessionToSwitchLotto,
    setSessionToSwitchLotto,
    switchLottoData,
    setSwitchLottoData,
    handleOpenSwitchLotto,
    handleSaveSwitchLotto,
    setPendingSession,
    setConflictingSessions,
    setSelectedConflictsToClose
  } = useSessioneActions({
    state,
    setState,
    activeTurnoId,
    activeSessions,
    showConfirm,
    setPausingTarget
  });


  const {
    isNewSessionMode,
    setIsNewSessionMode,
    newSessionData,
    setNewSessionData,
    lottoOptions,
    filteredArticoli,
    compatibleLottoOptions
  } = useSessionForm(state, activeTurno, sessionToSwitchLotto);

  const {
    showFilters,
    setShowFilters,
    sortConfig,
    filters,
    setFilters,
    timeFilter,
    setTimeFilter,
    processedSessions,
    hasActiveFilters,
    handleSort,
    clearFilters
  } = useSessionFilters({
    sessioni: state.sessioni,
    activeTurnoId,
    articoli: state.articoli,
    sigleLotto: state.sigleLotto
  });

  const { pedaneTodayCount, handleSavePedana, handleSaveScarto } = useProductionRecords(state, setState);

  // --- Handlers ---

  // --- Inline Edit Handlers ---
  const handleCellSave = (sessionId: string, field: 'inizio' | 'fine' | 'note', value: string) => {
    setState(prev => ({
      ...prev,
      sessioni: prev.sessioni.map(s => {
        if (s.id !== sessionId) return s;
        
        if (field === 'note') return { ...s, note: value };
        
        if (field === 'inizio') {
             return { ...s, inizio: updateIsoTime(s.inizio, value) };
        }
        
        if (field === 'fine' && s.fine) {
             return { ...s, fine: updateIsoTime(s.fine, value) };
        }
        
        return s;
      })
    }));
    setEditingCell(null);
  };

  const confirmPause = (motivo: string) => {
    if (!pausingTarget) return;
    const now = new Date().toISOString();

    setState(prev => {
      if (pausingTarget.type === 'SHIFT') {
        const updatedTurni = prev.turni.map(t => {
          if (t.id !== pausingTarget.id) return t;
          const newPause = [...t.pause, { inizio: now, motivo }];
          return { ...t, status: 'PAUSA' as const, pause: newPause };
        });

        const updatedSessions = prev.sessioni.map(s => {
          if (s.turnoId !== pausingTarget.id || s.status === 'CHIUSA' || s.status === 'PAUSA') return s;
          const sPause = [...s.pause, { inizio: now, motivo: `Pausa Turno: ${motivo}` }];
          return { ...s, status: 'PAUSA' as const, pause: sPause };
        });

        return { ...prev, turni: updatedTurni, sessioni: updatedSessions };
      }

      return {
        ...prev,
        sessioni: prev.sessioni.map(s => {
          if (s.id !== pausingTarget.id) return s;
          const newPause = [...s.pause, { inizio: now, motivo }];
          return { ...s, status: 'PAUSA' as const, pause: newPause };
        })
      };
    });

    setPausingTarget(null);
  };

  if (view === 'HOME') {
    return (
      <AppRoutes
        view={view}
        onStartTurno={handleStartTurno}
        onGoReport={() => setView('REPORT')}
        onGoSettings={() => setView('SETTINGS')}
        monitorNode={null}
        state={state}
        articoli={state.articoli}
        onUpdateData={(newData) => setState(prev => ({ ...prev, ...newData }))}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <aside className="bg-white md:w-64 border-r border-gray-200 flex-shrink-0 flex md:flex-col justify-between sticky top-0 z-20 shadow-sm">
        <div className="p-4 md:p-6 flex items-center gap-3 cursor-pointer" onClick={() => setView('HOME')}>
            <div className="bg-agri-600 p-2 rounded-lg"><Factory size={24} className="text-white" /></div>
            <span className="font-bold text-gray-800 text-lg hidden md:block">AgriTrack</span>
        </div>
        <nav className="flex md:flex-col flex-1 px-4 md:px-4 gap-2 overflow-x-auto md:overflow-visible">
            {activeTurnoId && (
                <button onClick={() => setView('MONITOR')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${view === 'MONITOR' ? 'bg-agri-50 text-agri-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <LayoutDashboard size={20} /> Monitoraggio
                </button>
            )}
            <button onClick={() => setView('REPORT')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${view === 'REPORT' ? 'bg-agri-50 text-agri-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                <FileText size={20} /> Report
            </button>
            <button onClick={() => setView('SETTINGS')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${view === 'SETTINGS' ? 'bg-agri-50 text-agri-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Settings size={20} /> Anagrafiche
            </button>
        </nav>
        {activeTurno && (
             <div className="p-4 border-t border-gray-200">
                <button onClick={handleCloseTurno} className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-3 rounded-lg transition-colors text-sm font-bold">
                    <LogOut size={18} /> Chiudi Turno
                </button>
             </div>
        )}
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <AppRoutes
          view={view}
          onStartTurno={handleStartTurno}
          onGoReport={() => setView('REPORT')}
          onGoSettings={() => setView('SETTINGS')}
          monitorNode={view === 'MONITOR' && activeTurno ? (
            <MonitorPage
              activeTurno={activeTurno}
              state={state}
              getAreaNome={getAreaNome}
              getLineaNome={getLineaNome}
              handleTogglePauseTurno={handleTogglePauseTurno}
              setIsScartoModalOpen={setIsScartoModalOpen}
              setIsNewSessionMode={setIsNewSessionMode}
              isNewSessionMode={isNewSessionMode}
              newSessionData={newSessionData}
              setNewSessionData={setNewSessionData}
              lottoOptions={lottoOptions}
              filteredArticoli={filteredArticoli}
              handleStartSession={handleStartSession}
              activeSessions={activeSessions}
              setSelectedSessionId={setSelectedSessionId}
              setIsPedanaModalOpen={setIsPedanaModalOpen}
              handleCloseSession={handleCloseSession}
              handleDeleteSession={handleDeleteSession}
              handleOpenSwitchLotto={handleOpenSwitchLotto}
              handleEditSession={handleEditSession}
              handleTogglePauseSession={handleTogglePauseSession}
              processedSessions={processedSessions}
              hasActiveFilters={hasActiveFilters}
              clearFilters={clearFilters}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              timeFilter={timeFilter}
              setTimeFilter={setTimeFilter}
              filters={filters}
              setFilters={setFilters}
              sortConfig={sortConfig}
              handleSort={handleSort}
              editingCell={editingCell}
              setEditingCell={setEditingCell}
              handleCellSave={handleCellSave}
            />
          ) : null}
          state={state}
          articoli={state.articoli}
          onUpdateData={(newData) => setState(prev => ({ ...prev, ...newData }))}
        />
      </main>

      {/* Modals Implementation */}
      {selectedSessionId && state.sessioni.find(s => s.id === selectedSessionId) && state.articoli.find(a => a.id === state.sessioni.find(s => s.id === selectedSessionId)?.articoloId) && (
        <PedanaModal 
            isOpen={isPedanaModalOpen}
            onClose={() => setIsPedanaModalOpen(false)}
            sessione={state.sessioni.find(s => s.id === selectedSessionId)!}
            sessioneLabel={getLineaNome(state.sessioni.find(s => s.id === selectedSessionId)!.lineaId)}
            lottoCode={state.sigleLotto.find(s => s.id === state.sessioni.find(ss => ss.id === selectedSessionId)?.siglaLottoId)?.code || 'N/D'}
            articolo={state.articoli.find(a => a.id === state.sessioni.find(s => s.id === selectedSessionId)?.articoloId)!}
            imballiOptions={state.imballi}
            calibriOptions={state.prodotti.find(p => p.id === state.articoli.find(a => a.id === state.sessioni.find(s => s.id === selectedSessionId)?.articoloId)?.prodottoId)?.calibri || []}
            pedaneTodayCount={pedaneTodayCount}
            onSave={(data) => { handleSavePedana(data); setIsPedanaModalOpen(false); }}
        />
      )}

      <ScartoModal 
        isOpen={isScartoModalOpen}
        onClose={() => setIsScartoModalOpen(false)}
        turnoId={activeTurnoId || ''}
        sigleLotto={state.sigleLotto}
        tipologieOptions={state.tipologieScarto.filter(t => t.attiva).map(t => t.nome)}
        onSave={handleSaveScarto}
      />

      {/* Edit Session Modal */}
      {isEditSessionMode && editingSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-orange-600 px-6 py-4 flex justify-between items-center text-white">
                    <h3 className="font-bold">Modifica Sessione</h3>
                    <button onClick={() => setIsEditSessionMode(false)}><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <SmartSelect label="Articolo" options={state.articoli} value={editSessionData.articoloId} onSelect={id => setEditSessionData({...editSessionData, articoloId: id})} />
                    <SmartSelect label="Sigla Lotto" options={lottoOptions} value={editSessionData.siglaLottoId} onSelect={id => setEditSessionData({...editSessionData, siglaLottoId: id})} />
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Data Ingresso</label>
                        <input type="date" className="w-full border rounded-lg p-2" value={editSessionData.dataIngresso} onChange={e => setEditSessionData({...editSessionData, dataIngresso: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Note</label>
                        <textarea className="w-full border rounded-lg p-2 text-sm" value={editSessionData.note} onChange={e => setEditSessionData({...editSessionData, note: e.target.value})} rows={3} placeholder="Aggiungi note..." />
                    </div>
                    <button onClick={handleSaveEditSession} className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl shadow-md">Salva Modifiche</button>
                </div>
            </div>
        </div>
      )}

      {/* Switch Lotto Modal */}
      {sessionToSwitchLotto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-agri-600 px-6 py-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2"><RefreshCw size={20} />Cambio Lotto</h3>
                    <button onClick={() => setSessionToSwitchLotto(null)}><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-500">Stai aggiornando il lotto per la sessione <strong>{state.articoli.find(a => a.id === sessionToSwitchLotto.articoloId)?.nome}</strong></p>
                    <SmartSelect label="Nuovo Lotto (Compatibile)" options={compatibleLottoOptions} value={switchLottoData.siglaLottoId} onSelect={id => setSwitchLottoData({...switchLottoData, siglaLottoId: id})} />
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Data Ingresso</label>
                        <input type="date" className="w-full border rounded-lg p-2" value={switchLottoData.dataIngresso} onChange={e => setSwitchLottoData({...switchLottoData, dataIngresso: e.target.value})} />
                    </div>
                    <button onClick={handleSaveSwitchLotto} className="w-full bg-agri-600 text-white font-bold py-3 rounded-xl shadow-md">Chiudi Sessione e Riapri con Nuovo Lotto</button>
                </div>
            </div>
          </div>
      )}

      {/* RIPRISTINATO: Modale Linea Occupata con design da immagine */}
      {pendingSession && conflictingSessions.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] overflow-hidden animate-in zoom-in-95">
            {/* Header Arancio Chiaro */}
            <div className="bg-[#fff7ed] px-6 py-5 flex items-center gap-4 border-b border-[#fed7aa]">
              <div className="bg-[#ffedd5] p-3 rounded-2xl text-[#c2410c]">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-[#9a3412]">Linea Occupata ({conflictingSessions.length})</h3>
                <p className="text-[#c2410c] text-sm">Ci sono già sessioni attive su {getLineaNome(pendingSession.lineaId)}</p>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-500 mb-5 text-sm">Seleziona le sessioni da chiudere prima di avviare la nuova:</p>

              {/* Lista Sessioni con Checkbox */}
              <div className="space-y-3 mb-8">
                {conflictingSessions.map(conf => (
                  <div key={conf.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-agri-500 transition-colors">
                    <button onClick={() => toggleConflictSelection(conf.id)} className="flex-shrink-0">
                      {selectedConflictsToClose.includes(conf.id) 
                        ? <CheckSquare className="text-agri-600" size={26} /> 
                        : <Square className="text-gray-300" size={26} />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {state.articoli.find(a => a.id === conf.articoloId)?.nome}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Lotto: {state.sigleLotto.find(s => s.id === conf.siglaLottoId)?.code}
                        <span className="mx-2 opacity-30">•</span> 
                        Inizio: {formatTime(conf.inizio)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottoni Principali */}
              <div className="space-y-3">
                <button 
                  onClick={() => executeStartSession(pendingSession, selectedConflictsToClose)}
                  className="w-full bg-agri-600 hover:bg-agri-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
                >
                  <RefreshCw size={20} /> 
                  Chiudi Selezionate ({selectedConflictsToClose.length}) e Avvia
                </button>
                
                <button 
                  onClick={() => executeStartSession(pendingSession, [])}
                  className="w-full bg-[#ffedd5] hover:bg-[#fed7aa] text-[#9a3412] font-bold py-4 rounded-xl flex items-center justify-center gap-2 border border-[#fdba74] transition-all active:scale-[0.98]"
                >
                  <AlertTriangle size={20} /> Avvia Comunque (Sovrapponi)
                </button>
                
                <button 
                   onClick={() => {
                       setPendingSession(null);
                       setConflictingSessions([]);
                       setSelectedConflictsToClose([]);
                   }}
                   className="w-full bg-white hover:bg-gray-50 text-gray-600 font-bold py-4 rounded-xl border border-gray-200 transition-all text-center"
                >
                  Annulla Operazione
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Motivo Pausa */}
      {pausingTarget && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="bg-amber-500 p-4 text-white flex justify-between items-center">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                          <Pause size={20} fill="currentColor" /> 
                          Motivo della Pausa
                      </h3>
                      <button onClick={() => setPausingTarget(null)}><X size={20} /></button>
                  </div>
                  <div className="p-6">
                      <p className="text-sm text-gray-500 mb-6">
                          Seleziona la causa della fermata per {pausingTarget.type === 'SHIFT' ? 'tutta la produzione' : 'questa linea'}:
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 mb-6">
                          {MOTIVI_PAUSA.map(motivo => (
                              <button 
                                  key={motivo}
                                  onClick={() => confirmPause(motivo)}
                                  className="p-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-amber-50 hover:border-amber-300 transition-all text-center flex items-center justify-center"
                              >
                                  {motivo}
                              </button>
                          ))}
                      </div>

                      <button 
                          onClick={() => setPausingTarget(null)}
                          className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl"
                      >
                          Annulla
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
export default App;
