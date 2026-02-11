import React, { useState, useEffect, useMemo } from 'react';
import { 
  AppState, Turno, SessioneLinea, 
  Pedana, Scarto, LineaName, PausaEvento 
} from './types';
import { INITIAL_ARTICOLI, INITIAL_SIGLE_LOTTO, INITIAL_IMBALLI, INITIAL_PRODOTTI, INITIAL_VARIETA, MOTIVI_PAUSA } from './constants';
import SessionCard from './components/SessionCard';
import PedanaModal from './components/PedanaModal';
import ScartoModal from './components/ScartoModal';
import ReportDashboard from './components/ReportDashboard';
import SettingsDashboard from './components/SettingsDashboard';
import SmartSelect from './components/SmartSelect';
import { LayoutDashboard, Factory, History, Plus, LogOut, FileText, Settings, PlayCircle, RefreshCw, Archive, Play, X, AlertTriangle, CheckSquare, Square, Activity, Pencil, StickyNote, ArrowUp, ArrowDown, Filter, XCircle, Clock, RotateCcw, Pause, Trash2 } from 'lucide-react';
import { useDialog } from './components/DialogContext';
import { formatTime, formatDateTime, updateIsoTime } from './utils';

const App: React.FC = () => {
  const { showAlert, showConfirm } = useDialog();

  // --- State ---
  const [view, setView] = useState<'HOME' | 'MONITOR' | 'REPORT' | 'SETTINGS'>('HOME');
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('agritrack_state');
    if (saved) return JSON.parse(saved);
    
    return { 
      turni: [], 
      sessioni: [], 
      pedane: [], 
      scarti: [],
      prodotti: INITIAL_PRODOTTI,
      varieta: INITIAL_VARIETA,
      articoli: INITIAL_ARTICOLI,
      sigleLotto: INITIAL_SIGLE_LOTTO,
      imballi: INITIAL_IMBALLI
    };
  });
  
  const [activeTurnoId, setActiveTurnoId] = useState<string | null>(null);
  
  // Modal States
  const [isPedanaModalOpen, setIsPedanaModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isScartoModalOpen, setIsScartoModalOpen] = useState(false);
  const [pausingTarget, setPausingTarget] = useState<{ type: 'SHIFT' | 'SESSION', id: string } | null>(null);

  // New Session Form State
  const [isNewSessionMode, setIsNewSessionMode] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    linea: LineaName.L1,
    articoloId: '',
    siglaLottoId: '',
    dataIngresso: new Date().toISOString().split('T')[0]
  });

  // Edit Session State (Modal)
  const [isEditSessionMode, setIsEditSessionMode] = useState(false);
  const [editingSession, setEditingSession] = useState<SessioneLinea | null>(null);
  const [editSessionData, setEditSessionData] = useState({
    articoloId: '',
    siglaLottoId: '',
    dataIngresso: '',
    note: ''
  });

  // Inline Edit State (Table Time & Note)
  const [editingCell, setEditingCell] = useState<{ sessionId: string, field: 'inizio' | 'fine' | 'note' } | null>(null);

  // --- Table Sorting & Filtering State ---
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'inizio', direction: 'desc' });
  
  // Basic Text Filters
  const [filters, setFilters] = useState({
    linea: '',
    articolo: '',
    lotto: '',
    stato: '',
    note: ''
  });

  // Advanced Time Filter
  const [timeFilter, setTimeFilter] = useState<{
    mode: 'AFTER' | 'BEFORE' | 'RANGE';
    start: string;
    end: string;
  }>({
    mode: 'RANGE', // Default range per UI compatta
    start: '',
    end: ''
  });

  // --- CONFLICT HANDLING STATE ---
  const [pendingSession, setPendingSession] = useState<SessioneLinea | null>(null);
  const [conflictingSessions, setConflictingSessions] = useState<SessioneLinea[]>([]);
  const [selectedConflictsToClose, setSelectedConflictsToClose] = useState<string[]>([]);

  // Change Lotto State
  const [sessionToSwitchLotto, setSessionToSwitchLotto] = useState<SessioneLinea | null>(null);
  const [switchLottoData, setSwitchLottoData] = useState({
    siglaLottoId: '',
    dataIngresso: new Date().toISOString().split('T')[0]
  });

  // Restore active turno on load
  useEffect(() => {
    const active = state.turni.find(t => t.status === 'APERTO' || t.status === 'PAUSA');
    if (active) {
        setActiveTurnoId(active.id);
        setView('MONITOR');
    }
  }, []);

  // Persist State
  useEffect(() => {
    localStorage.setItem('agritrack_state', JSON.stringify(state));
  }, [state]);

  // --- Computed ---
  const activeTurno = state.turni.find(t => t.id === activeTurnoId);
  const activeSessions = state.sessioni.filter(s => s.turnoId === activeTurnoId && s.status !== 'CHIUSA');
  
  // Base history data
  const shiftSessionsHistoryRaw = state.sessioni
    .filter(s => s.turnoId === activeTurnoId);

  // Filtered & Sorted History Data
  const processedSessions = useMemo(() => {
    let data = shiftSessionsHistoryRaw.map(s => ({
      ...s,
      articoloNome: state.articoli.find(a => a.id === s.articoloId)?.nome || '',
      lottoCodice: state.sigleLotto.find(l => l.id === s.siglaLottoId)?.code || '',
      stato: s.status
    }));

    if (filters.linea) data = data.filter(s => s.linea === filters.linea);
    if (filters.articolo) data = data.filter(s => s.articoloNome.toLowerCase().includes(filters.articolo.toLowerCase()));
    if (filters.lotto) data = data.filter(s => s.lottoCodice.toLowerCase().includes(filters.lotto.toLowerCase()));
    if (filters.stato) data = data.filter(s => s.stato === filters.stato);
    if (filters.note) data = data.filter(s => (s.note || '').toLowerCase().includes(filters.note.toLowerCase()));
    
    if (timeFilter.start) {
        data = data.filter(s => {
            const sessionTime = new Date(s.inizio).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'});
            if (timeFilter.mode === 'AFTER') return sessionTime >= timeFilter.start;
            if (timeFilter.mode === 'BEFORE') return sessionTime <= timeFilter.start;
            if (timeFilter.mode === 'RANGE') {
                if (!timeFilter.end) return sessionTime >= timeFilter.start;
                return sessionTime >= timeFilter.start && sessionTime <= timeFilter.end;
            }
            return true;
        });
    }

    if (sortConfig) {
      data.sort((a, b) => {
        // @ts-ignore
        const valA = a[sortConfig.key];
        // @ts-ignore
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [shiftSessionsHistoryRaw, state.articoli, state.sigleLotto, filters, sortConfig, timeFilter]);

  const hasActiveFilters = Object.values(filters).some(val => val !== '') || !!timeFilter.start;

  // Filter Articles based on selected Lotto
  const selectedLotto = state.sigleLotto.find(s => s.id === newSessionData.siglaLottoId);
  const selectedLottoVarieta = selectedLotto ? state.varieta.find(v => v.id === selectedLotto.varietaId) : null;
  const filteredArticoli = state.articoli.filter(art => {
      if (!art.prodottoId) return true;
      if (!selectedLottoVarieta) return false;
      if (art.prodottoId !== selectedLottoVarieta.prodottoId) return false;
      if (art.varietaId && art.varietaId !== selectedLottoVarieta.id) return false;
      if (art.categoria && art.categoria !== selectedLottoVarieta.categoria) return false;
      return true;
  });

  const lottoOptions = state.sigleLotto.map(s => ({
      ...s, codice: s.code, nome: `${s.produttore} (${s.campo})`
  }));

  // Filter compatible Lottos for Switching
  const compatibleLottoOptions = useMemo(() => {
    if (!sessionToSwitchLotto) return [];
    const currentArt = state.articoli.find(a => a.id === sessionToSwitchLotto.articoloId);
    if(!currentArt) return lottoOptions;

    return lottoOptions.filter(opt => {
        const v = state.varieta.find(varItem => varItem.id === opt.varietaId);
        if (!v) return false;

        if (currentArt.prodottoId && v.prodottoId !== currentArt.prodottoId) return false;
        if (currentArt.varietaId && v.id !== currentArt.varietaId) return false;
        if (currentArt.categoria && v.categoria !== currentArt.categoria) return false;

        return true;
    });
  }, [sessionToSwitchLotto, lottoOptions, state.articoli, state.varieta]);

  const pedaneTodayCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return state.pedane.filter(p => p.timestamp.startsWith(today)).length;
  }, [state.pedane]);

  // --- Handlers ---

  const handleStartTurno = () => {
    const newTurno: Turno = {
      id: crypto.randomUUID(),
      inizio: new Date().toISOString(),
      operatore: 'Op. Principale',
      status: 'APERTO',
      pause: []
    };
    setState(prev => ({ ...prev, turni: [...prev.turni, newTurno] }));
    setActiveTurnoId(newTurno.id);
    setView('MONITOR');
  };

  const handleTogglePauseTurno = async () => {
    if (!activeTurno) return;
    const isCurrentlyPaused = activeTurno.status === 'PAUSA';
    const now = new Date().toISOString();

    if (isCurrentlyPaused) {
        // Ripresa diretta senza motivo
        setState(prev => {
          const updatedTurni = prev.turni.map(t => {
            if (t.id !== activeTurnoId) return t;
            const newPause = [...t.pause];
            if (newPause.length > 0) newPause[newPause.length - 1].fine = now;
            return { ...t, status: 'APERTO' as const, pause: newPause };
          });

          const updatedSessions = prev.sessioni.map(s => {
            if (s.turnoId !== activeTurnoId || s.status !== 'PAUSA') return s;
            const sPause = [...s.pause];
            if (sPause.length > 0) sPause[sPause.length - 1].fine = now;
            return { ...s, status: 'ATTIVA' as const, pause: sPause };
          });

          return { ...prev, turni: updatedTurni, sessioni: updatedSessions };
        });
    } else {
        // Richiesta motivo pausa
        setPausingTarget({ type: 'SHIFT', id: activeTurno.id });
    }
  };

  const handleTogglePauseSession = (sessionId: string) => {
    const now = new Date().toISOString();
    const session = state.sessioni.find(s => s.id === sessionId);
    if (!session) return;

    if (session.status === 'PAUSA') {
        // Ripresa diretta
        setState(prev => ({
          ...prev,
          sessioni: prev.sessioni.map(s => {
            if (s.id !== sessionId) return s;
            const newPause = [...s.pause];
            if (newPause.length > 0) newPause[newPause.length - 1].fine = now;
            return { ...s, status: 'ATTIVA', pause: newPause };
          })
        }));
    } else {
        // Richiesta motivo pausa
        setPausingTarget({ type: 'SESSION', id: sessionId });
    }
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
        } else {
            return {
                ...prev,
                sessioni: prev.sessioni.map(s => {
                    if (s.id !== pausingTarget.id) return s;
                    const newPause = [...s.pause, { inizio: now, motivo }];
                    return { ...s, status: 'PAUSA' as const, pause: newPause };
                })
            };
        }
    });

    setPausingTarget(null);
  };

  const handleStartSession = async () => {
    if (!newSessionData.articoloId || !newSessionData.siglaLottoId) return;
    const proposedSession: SessioneLinea = {
        id: crypto.randomUUID(),
        turnoId: activeTurnoId!,
        linea: newSessionData.linea,
        articoloId: newSessionData.articoloId,
        siglaLottoId: newSessionData.siglaLottoId,
        dataIngresso: newSessionData.dataIngresso,
        inizio: new Date().toISOString(),
        status: 'ATTIVA',
        pause: [],
        note: ''
    };
    checkConflictsAndPrepareStart(proposedSession);
  };

  const checkConflictsAndPrepareStart = (proposedSession: SessioneLinea) => {
    const overlaps = activeSessions.filter(s => s.linea === proposedSession.linea);
    if (overlaps.length > 0) {
        setPendingSession(proposedSession);
        setConflictingSessions(overlaps);
        setSelectedConflictsToClose(overlaps.map(o => o.id)); 
        return; 
    }
    executeStartSession(proposedSession, []);
  };

  const executeStartSession = (sessionToStart: SessioneLinea, idsToClose: string[]) => {
    const now = new Date().toISOString();
    setState(prev => {
        let updatedSessions = prev.sessioni.map(s => 
          idsToClose.includes(s.id) ? { ...s, fine: now, status: 'CHIUSA' as const } : s
        );
        updatedSessions.push(sessionToStart);
        return { ...prev, sessioni: updatedSessions };
    });
    setPendingSession(null);
    setConflictingSessions([]);
    setSelectedConflictsToClose([]);
    setIsNewSessionMode(false);
  };

  const toggleConflictSelection = (id: string) => {
    setSelectedConflictsToClose(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCloseSession = async (sessionId: string) => {
    const confirmed = await showConfirm({
        title: 'Chiudi Sessione',
        message: 'Terminare definitivamente la lavorazione?',
        variant: 'INFO'
    });
    if(!confirmed) return;
    setState(prev => ({
        ...prev,
        sessioni: prev.sessioni.map(s => s.id === sessionId ? { ...s, fine: new Date().toISOString(), status: 'CHIUSA' as const } : s)
    }));
  };

  const handleDeleteSession = async (sessionId: string) => {
    const sessionPedane = state.pedane.filter(p => p.sessioneId === sessionId);
    const hasPedane = sessionPedane.length > 0;

    const confirmed = await showConfirm({
      title: 'Elimina Sessione',
      message: hasPedane 
        ? `Questa sessione contiene ${sessionPedane.length} pedane. Eliminando la sessione, verranno eliminate anche tutte le pedane collegate. Questa operazione non è reversibile. Continuare?`
        : 'Sei sicuro di voler eliminare definitivamente questa sessione?',
      variant: 'DANGER',
      confirmText: 'Elimina Tutto',
      cancelText: 'Annulla'
    });

    if (!confirmed) return;

    setState(prev => ({
      ...prev,
      sessioni: prev.sessioni.filter(s => s.id !== sessionId),
      pedane: prev.pedane.filter(p => p.sessioneId !== sessionId)
    }));
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };
  
  const resetSort = () => setSortConfig(null);
  const clearFilters = () => {
      setFilters({ linea: '', articolo: '', lotto: '', stato: '', note: '' });
      setTimeFilter({ mode: 'RANGE', start: '', end: '' });
  };

  const handleCloseTurno = async () => {
    const confirmed = await showConfirm({
        title: 'Chiudi Turno',
        message: 'Sei sicuro di voler chiudere il turno? Tutte le sessioni verranno terminate.',
        variant: 'DANGER'
    });
    if(!confirmed) return;
    const now = new Date().toISOString();
    setState(prev => ({
        ...prev,
        turni: prev.turni.map(t => t.id === activeTurnoId ? { ...t, fine: now, status: 'CHIUSO' } : t),
        sessioni: prev.sessioni.map(s => (s.turnoId === activeTurnoId && s.status !== 'CHIUSA') ? { ...s, fine: now, status: 'CHIUSA' } : s)
    }));
    setActiveTurnoId(null);
    setView('HOME');
  };

  const handleEditSession = (session: SessioneLinea) => {
    setEditingSession(session);
    setEditSessionData({
      articoloId: session.articoloId,
      siglaLottoId: session.siglaLottoId,
      dataIngresso: session.dataIngresso,
      note: session.note || ''
    });
    setIsEditSessionMode(true);
  };

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

  const handleOpenSwitchLotto = (session: SessioneLinea) => {
    setSessionToSwitchLotto(session);
    setSwitchLottoData({
      siglaLottoId: session.siglaLottoId,
      dataIngresso: session.dataIngresso
    });
  };

  const handleSavePedana = (pedanaData: Omit<Pedana, 'id' | 'timestamp'>) => {
    const newPedana: Pedana = {
      ...pedanaData,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    setState(prev => ({ ...prev, pedane: [...prev.pedane, newPedana] }));
    setIsPedanaModalOpen(false);
  };

  const handleSaveScarto = (scartoData: Omit<Scarto, 'id' | 'timestamp'>) => {
    const newScarto: Scarto = {
      ...scartoData,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    setState(prev => ({ ...prev, scarti: [...prev.scarti, newScarto] }));
  };

  const handleSaveEditSession = () => {
    if (!editingSession) return;
    setState(prev => ({
      ...prev,
      sessioni: prev.sessioni.map(s => s.id === editingSession.id ? {
        ...s,
        articoloId: editSessionData.articoloId,
        siglaLottoId: editSessionData.siglaLottoId,
        dataIngresso: editSessionData.dataIngresso,
        note: editSessionData.note
      } : s)
    }));
    setIsEditSessionMode(false);
    setEditingSession(null);
  };

  const handleSaveSwitchLotto = () => {
    if (!sessionToSwitchLotto) return;
    const now = new Date().toISOString();

    const newSession: SessioneLinea = {
        ...sessionToSwitchLotto,
        id: crypto.randomUUID(),
        inizio: now,
        fine: undefined,
        status: 'ATTIVA',
        pause: [],
        siglaLottoId: switchLottoData.siglaLottoId,
        dataIngresso: switchLottoData.dataIngresso,
        note: sessionToSwitchLotto.note
    };

    setState(prev => ({
      ...prev,
      sessioni: [
        ...prev.sessioni.map(s => s.id === sessionToSwitchLotto.id ? { ...s, fine: now, status: 'CHIUSA' as const } : s),
        newSession
      ]
    }));
    setSessionToSwitchLotto(null);
  };

  const renderSortableHeader = (label: string, key: string, widthClass: string = '') => {
    const isSorted = sortConfig?.key === key;
    return (
      <th 
        className={`px-6 py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-agri-600 transition-colors whitespace-nowrap ${widthClass}`}
        onClick={() => handleSort(key)}
      >
        <div className="flex items-center gap-1">
          {label}
          {/* Reserved space for icon to prevent jumping */}
          <div className={`w-4 flex justify-center transition-opacity ${isSorted ? 'opacity-100' : 'opacity-0'}`}>
             {isSorted && (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
             {!isSorted && <div className="w-3 h-3" />}
          </div>
        </div>
      </th>
    );
  };

  const renderHome = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <div className="bg-agri-600 p-4 rounded-2xl shadow-xl mb-6">
            <Factory size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">AgriTrack</h1>
          <p className="text-gray-500 mt-2">Sistema Gestione Produzione e Tracciabilità</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <button 
            onClick={handleStartTurno}
            className="w-full flex items-center justify-center gap-3 bg-agri-600 hover:bg-agri-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95"
          >
            <PlayCircle size={24} />
            INIZIA TURNO
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setView('REPORT')}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 font-bold gap-2"
            >
              <FileText size={24} className="text-agri-600" />
              Report
            </button>
            <button 
              onClick={() => setView('SETTINGS')}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 font-bold gap-2"
            >
              <Settings size={24} className="text-agri-600" />
              Anagrafiche
            </button>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 mt-8">AgriTrack Production Management System</p>
      </div>
    </div>
  );

  if (view === 'HOME') return renderHome();

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
        {view === 'MONITOR' && activeTurno ? (
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${activeTurno.status === 'PAUSA' ? 'bg-amber-100 text-amber-800' : 'bg-agri-100 text-agri-800'}`}>
                                {activeTurno.status === 'PAUSA' ? 'Turno in Pausa' : 'Turno Attivo'}
                            </span>
                            <h2 className="text-3xl font-black text-gray-900 mt-1">Produzione</h2>
                            <p className="text-gray-500 text-sm">Op: {activeTurno.operatore} • Inizio: {formatTime(activeTurno.inizio)}</p>
                        </div>
                        <button 
                          onClick={handleTogglePauseTurno}
                          className={`p-3 rounded-full shadow-md transition-all ${activeTurno.status === 'PAUSA' ? 'bg-agri-600 text-white hover:bg-agri-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
                          title={activeTurno.status === 'PAUSA' ? "Riprendi Turno" : "Metti Turno in Pausa"}
                        >
                          {activeTurno.status === 'PAUSA' ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                        </button>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={() => setIsScartoModalOpen(true)} className="flex-1 md:flex-none bg-white border-2 border-red-100 hover:border-red-300 text-red-600 font-bold px-4 py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
                            <Plus size={16} /> Scarto
                        </button>
                        <button onClick={() => setIsNewSessionMode(true)} className="flex-1 md:flex-none bg-gray-900 hover:bg-gray-800 text-white font-bold px-4 py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                            <Plus size={20} /> Nuova Sessione
                        </button>
                    </div>
                </div>

                {isNewSessionMode && (
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-agri-100 animate-in slide-in-from-top-4">
                        <h3 className="font-bold text-lg mb-4 text-gray-800">Avvia Nuova Sessione</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Linea</label>
                                <select className="w-full p-2 border border-gray-300 rounded-lg font-medium" value={newSessionData.linea} onChange={e => setNewSessionData({...newSessionData, linea: e.target.value as LineaName})}>
                                    {Object.values(LineaName).map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Data Ingresso</label>
                                <input type="date" className="w-full p-2 border border-gray-300 rounded-lg font-medium" value={newSessionData.dataIngresso} onChange={e => setNewSessionData({...newSessionData, dataIngresso: e.target.value})} />
                            </div>
                            <div><SmartSelect label="Sigla Lotto" options={lottoOptions} value={newSessionData.siglaLottoId} onSelect={(id) => setNewSessionData({...newSessionData, siglaLottoId: id, articoloId: ''})} placeholder="Lotto..." /></div>
                            <div><SmartSelect label="Articolo" options={filteredArticoli} value={newSessionData.articoloId} onSelect={(id) => setNewSessionData({...newSessionData, articoloId: id})} placeholder="Articolo..." disabled={!newSessionData.siglaLottoId} /></div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsNewSessionMode(false)} className="px-4 py-2 text-gray-500 font-medium">Annulla</button>
                            <button onClick={handleStartSession} className="px-6 py-2 bg-agri-600 text-white rounded-lg font-bold shadow hover:bg-agri-700">Avvia Sessione</button>
                        </div>
                    </div>
                )}

                {activeSessions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <h3 className="text-xl text-gray-400 font-bold mb-2">Nessuna sessione attiva.</h3>
                        <p className="text-gray-400">Clicca "Nuova Sessione" per iniziare.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {activeSessions.map(session => {
                            const articolo = state.articoli.find(a => a.id === session.articoloId)!;
                            const lottoCode = state.sigleLotto.find(s => s.id === session.siglaLottoId)?.code || '???';
                            return (
                                <SessionCard 
                                    key={session.id}
                                    sessione={session}
                                    articolo={articolo}
                                    dataIngresso={session.dataIngresso}
                                    siglaLottoCode={lottoCode}
                                    pedaneSessione={state.pedane.filter(p => p.sessioneId === session.id)}
                                    onAddPedana={() => { setSelectedSessionId(session.id); setIsPedanaModalOpen(true); }}
                                    onCloseSession={() => handleCloseSession(session.id)}
                                    onDeleteSession={() => handleDeleteSession(session.id)}
                                    onChangeLotto={() => handleOpenSwitchLotto(session)}
                                    onEditSession={() => handleEditSession(session)}
                                    onTogglePause={() => handleTogglePauseSession(session.id)}
                                />
                            );
                        })}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2"><Archive size={18} className="text-gray-500"/><h3 className="font-bold text-gray-700">Storico Sessioni Turno</h3></div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 font-medium border-r border-gray-300 pr-4">{processedSessions.length} sessioni</span>
                            {hasActiveFilters && (
                                <button 
                                    onClick={clearFilters} 
                                    className="text-orange-500 hover:text-orange-600 transition-colors"
                                    title="Resetta Filtri"
                                >
                                    <RotateCcw size={20} />
                                </button>
                            )}
                            <button 
                                onClick={() => setShowFilters(!showFilters)} 
                                className={`p-1.5 rounded-lg transition-colors ${showFilters ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                                <Filter size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    {renderSortableHeader('Inizio/Fine', 'inizio', 'w-[140px]')}
                                    {renderSortableHeader('Linea', 'linea', 'w-[100px]')}
                                    {renderSortableHeader('Articolo', 'articoloNome', 'w-auto')}
                                    {renderSortableHeader('Lotto', 'lottoCodice', 'w-[180px]')}
                                    {renderSortableHeader('Stato', 'stato', 'w-[100px]')}
                                    {renderSortableHeader('Note', 'note', 'w-[200px]')}
                                    <th className="px-6 py-3 text-right font-medium text-gray-500 w-[160px]">Azioni</th>
                                </tr>
                                {showFilters && (
                                    <tr className="bg-white border-b border-gray-200">
                                        <td className="px-6 py-2 align-top">
                                            <div className="flex flex-col gap-1">
                                                <select 
                                                    className="w-full p-1 border border-gray-200 rounded text-xs bg-gray-50 focus:border-agri-500 focus:ring-1 focus:ring-agri-500 font-bold"
                                                    value={timeFilter.mode}
                                                    onChange={(e: any) => setTimeFilter({...timeFilter, mode: e.target.value})}
                                                >
                                                    <option value="RANGE">Tra le... e le...</option>
                                                    <option value="AFTER">Dopo le...</option>
                                                    <option value="BEFORE">Prima delle...</option>
                                                </select>
                                                <div className="flex gap-1">
                                                    <input 
                                                        type="time" 
                                                        className="w-full p-1 border border-gray-200 rounded text-xs focus:border-agri-500 focus:ring-1 focus:ring-agri-500"
                                                        value={timeFilter.start}
                                                        onChange={e => setTimeFilter({...timeFilter, start: e.target.value})}
                                                    />
                                                    {timeFilter.mode === 'RANGE' && (
                                                        <input 
                                                            type="time" 
                                                            className="w-full p-1 border border-gray-200 rounded text-xs focus:border-agri-500 focus:ring-1 focus:ring-agri-500"
                                                            value={timeFilter.end}
                                                            onChange={e => setTimeFilter({...timeFilter, end: e.target.value})}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 align-top">
                                            <select 
                                                className="w-full p-1.5 border border-gray-200 rounded text-xs bg-gray-50 font-bold focus:border-agri-500 focus:ring-1 focus:ring-agri-500"
                                                value={filters.linea} 
                                                onChange={e => setFilters({...filters, linea: e.target.value})}
                                            >
                                                <option value="">Tutte</option>
                                                {Object.values(LineaName).map(l => <option key={l} value={l}>{l}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-6 py-2 align-top">
                                            <input 
                                                type="text" 
                                                className="w-full p-1.5 border border-gray-200 rounded text-xs bg-gray-50 focus:border-agri-500 focus:ring-1 focus:ring-agri-500"
                                                placeholder="Cerca..."
                                                value={filters.articolo} 
                                                onChange={e => setFilters({...filters, articolo: e.target.value})}
                                            />
                                        </td>
                                        <td className="px-6 py-2 align-top">
                                            <input 
                                                type="text" 
                                                className="w-full p-1.5 border border-gray-200 rounded text-xs bg-gray-50 focus:border-agri-500 focus:ring-1 focus:ring-agri-500"
                                                placeholder="Cerca..."
                                                value={filters.lotto} 
                                                onChange={e => setFilters({...filters, lotto: e.target.value})}
                                            />
                                        </td>
                                        <td className="px-6 py-2 align-top">
                                            <select 
                                                className="w-full p-1.5 border border-gray-200 rounded text-xs bg-gray-50 font-bold focus:border-agri-500 focus:ring-1 focus:ring-agri-500"
                                                value={filters.stato} 
                                                onChange={e => setFilters({...filters, stato: e.target.value})}
                                            >
                                                <option value="">Tutti</option>
                                                <option value="ATTIVA">ATTIVA</option>
                                                <option value="PAUSA">PAUSA</option>
                                                <option value="CHIUSA">CHIUSA</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-2 align-top">
                                            <input 
                                                type="text" 
                                                className="w-full p-1.5 border border-gray-200 rounded text-xs bg-gray-50 focus:border-agri-500 focus:ring-1 focus:ring-agri-500"
                                                placeholder="Cerca..."
                                                value={filters.note} 
                                                onChange={e => setFilters({...filters, note: e.target.value})}
                                            />
                                        </td>
                                        <td className="px-6 py-2 align-top"></td>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {processedSessions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center">
                                            {hasActiveFilters ? (
                                                <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="bg-gray-100 p-4 rounded-full mb-3">
                                                        <X size={32} className="text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500 font-medium mb-2">Nessuna sessione trovata per i criteri selezionati.</p>
                                                    <button 
                                                        onClick={clearFilters}
                                                        className="text-agri-600 font-bold hover:underline decoration-2 underline-offset-4 transition-all"
                                                    >
                                                        Resetta tutti i filtri
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">Nessuna sessione registrata in questo turno.</span>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    processedSessions.map(session => {
                                    const art = state.articoli.find(a => a.id === session.articoloId);
                                    return (
                                        <tr key={session.id} className={`hover:bg-gray-50 transition-colors ${session.status === 'PAUSA' ? 'bg-amber-50/50' : ''}`}>
                                            <td className="px-6 py-3 text-gray-600">
                                                {/* Inizio */}
                                                {editingCell?.sessionId === session.id && editingCell?.field === 'inizio' ? (
                                                    <input 
                                                        type="time" 
                                                        className="border rounded p-1 text-xs"
                                                        defaultValue={new Date(session.inizio).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}
                                                        autoFocus
                                                        onBlur={(e) => handleCellSave(session.id, 'inizio', e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleCellSave(session.id, 'inizio', e.currentTarget.value)}
                                                    />
                                                ) : (
                                                    <span 
                                                        className="cursor-pointer"
                                                        onClick={() => setEditingCell({sessionId: session.id, field: 'inizio'})}
                                                        title={formatDateTime(session.inizio)}
                                                    >
                                                        {formatTime(session.inizio)}
                                                    </span>
                                                )}
                                                <span className="mx-1">-</span>
                                                {/* Fine */}
                                                {session.fine ? (
                                                    editingCell?.sessionId === session.id && editingCell?.field === 'fine' ? (
                                                        <input 
                                                            type="time" 
                                                            className="border rounded p-1 text-xs"
                                                            defaultValue={new Date(session.fine).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}
                                                            autoFocus
                                                            onBlur={(e) => handleCellSave(session.id, 'fine', e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleCellSave(session.id, 'fine', e.currentTarget.value)}
                                                        />
                                                    ) : (
                                                        <span 
                                                            className="cursor-pointer"
                                                            onClick={() => setEditingCell({sessionId: session.id, field: 'fine'})}
                                                            title={formatDateTime(session.fine)}
                                                        >
                                                            {formatTime(session.fine)}
                                                        </span>
                                                    )
                                                ) : '...'}
                                            </td>
                                            <td className="px-6 py-3 font-medium">{session.linea}</td>
                                            <td className="px-6 py-3">{art?.nome}</td>
                                            <td className="px-6 py-3 font-mono text-xs">{session.lottoCodice}</td>
                                            <td className="px-6 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${session.status === 'ATTIVA' ? 'bg-green-100 text-green-800' : session.status === 'PAUSA' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                                    {session.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-gray-500 italic truncate max-w-[100px]">
                                                {editingCell?.sessionId === session.id && editingCell?.field === 'note' ? (
                                                     <input 
                                                        type="text" 
                                                        className="w-full border rounded p-1 text-xs"
                                                        defaultValue={session.note || ''}
                                                        autoFocus
                                                        onBlur={(e) => handleCellSave(session.id, 'note', e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleCellSave(session.id, 'note', e.currentTarget.value)}
                                                    />
                                                ) : (
                                                    <span 
                                                        className="cursor-pointer block min-h-[20px]"
                                                        onClick={() => setEditingCell({sessionId: session.id, field: 'note'})}
                                                        title={session.note || "Clicca per aggiungere nota"}
                                                    >
                                                        {session.note || <span className="text-gray-300 text-xs">Aggiungi...</span>}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-right flex justify-end items-center gap-2">
                                                {session.status !== 'CHIUSA' && (
                                                  <>
                                                    {/* 1. Pausa / Riprendi */}
                                                    <button 
                                                      onClick={() => handleTogglePauseSession(session.id)}
                                                      className={`p-1 transition-colors ${session.status === 'PAUSA' ? 'text-agri-600 hover:text-agri-700' : 'text-amber-500 hover:text-amber-600'}`}
                                                      title={session.status === 'PAUSA' ? "Riprendi" : "Metti in Pausa"}
                                                    >
                                                      {session.status === 'PAUSA' ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
                                                    </button>
                                                    {/* 2. Chiudi */}
                                                    <button onClick={() => handleCloseSession(session.id)} className="text-red-500 hover:text-red-700 p-1" title="Chiudi"><Square size={16} fill="currentColor" /></button>
                                                    {/* 3. Cambio Lotto */}
                                                    <button onClick={() => handleOpenSwitchLotto(session)} className="text-gray-400 hover:text-agri-600 p-1" title="Cambio Lotto"><RefreshCw size={16} /></button>
                                                  </>
                                                )}
                                                {/* 4. Modifica */}
                                                <button onClick={() => handleEditSession(session)} className="text-gray-400 hover:text-orange-600 p-1" title="Modifica"><Pencil size={16} /></button>
                                                {/* 5. Elimina */}
                                                <button onClick={() => handleDeleteSession(session.id)} className="text-gray-400 hover:text-red-600 p-1" title="Elimina Definitivamente"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    );
                                }))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        ) : view === 'REPORT' ? <ReportDashboard data={state} articolis={state.articoli} /> : <SettingsDashboard data={state} onUpdateData={(newData) => setState(prev => ({ ...prev, ...newData }))} />}
      </main>

      {/* Modals Implementation */}
      {selectedSessionId && state.sessioni.find(s => s.id === selectedSessionId) && state.articoli.find(a => a.id === state.sessioni.find(s => s.id === selectedSessionId)?.articoloId) && (
        <PedanaModal 
            isOpen={isPedanaModalOpen}
            onClose={() => setIsPedanaModalOpen(false)}
            sessione={state.sessioni.find(s => s.id === selectedSessionId)!}
            articolo={state.articoli.find(a => a.id === state.sessioni.find(s => s.id === selectedSessionId)?.articoloId)!}
            imballiOptions={state.imballi}
            calibriOptions={state.prodotti.find(p => p.id === state.articoli.find(a => a.id === state.sessioni.find(s => s.id === selectedSessionId)?.articoloId)?.prodottoId)?.calibri || []}
            pedaneTodayCount={pedaneTodayCount}
            onSave={handleSavePedana}
        />
      )}

      <ScartoModal 
        isOpen={isScartoModalOpen}
        onClose={() => setIsScartoModalOpen(false)}
        turnoId={activeTurnoId || ''}
        sigleLotto={state.sigleLotto}
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
                <p className="text-[#c2410c] text-sm">Ci sono già sessioni attive su {pendingSession.linea}</p>
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