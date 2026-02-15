import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { AppState, Pedana, SessioneLinea } from '../types';
import { buildSessione } from '../core/services/SessioneService';
import { SessioneConflictService } from '../core/services/domain/SessioneConflictService';
import { ProductionValidationService } from '../core/services/domain/ProductionValidationService';
import { DialogOptions } from '../components/DialogContext';

interface Params {
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  activeTurnoId: string | null;
  activeSessions: SessioneLinea[];
  showConfirm: (opts: DialogOptions) => Promise<boolean>;
  setPausingTarget: (target: { type: 'SHIFT' | 'SESSION'; id: string } | null) => void;
}

export const useSessioneActions = ({ state, setState, activeTurnoId, activeSessions, showConfirm, setPausingTarget }: Params) => {
  const [pendingSession, setPendingSession] = useState<SessioneLinea | null>(null);
  const [conflictingSessions, setConflictingSessions] = useState<SessioneLinea[]>([]);
  const [selectedConflictsToClose, setSelectedConflictsToClose] = useState<string[]>([]);

  const [isEditSessionMode, setIsEditSessionMode] = useState(false);
  const [editingSession, setEditingSession] = useState<SessioneLinea | null>(null);
  const [editSessionData, setEditSessionData] = useState({ articoloId: '', siglaLottoId: '', dataIngresso: '', note: '' });

  const [editingCell, setEditingCell] = useState<{ sessionId: string; field: 'inizio' | 'fine' | 'note' } | null>(null);

  const [sessionToSwitchLotto, setSessionToSwitchLotto] = useState<SessioneLinea | null>(null);
  const [switchLottoData, setSwitchLottoData] = useState({ siglaLottoId: '', dataIngresso: new Date().toISOString().split('T')[0] });

  const conflictService = useMemo(() => new SessioneConflictService(), []);
  const validationService = useMemo(() => new ProductionValidationService(), []);

  const handleStartSession = (newSessionData: { lineaId: string; articoloId: string; siglaLottoId: string; dataIngresso: string }) => {
    try {
    validationService.ensureRequired(newSessionData.articoloId, 'Articolo');
    validationService.ensureRequired(newSessionData.siglaLottoId, 'Sigla lotto');
    validationService.ensureRequired(newSessionData.lineaId, 'Linea');
    if (!activeTurnoId) return;
    const proposedSession = buildSessione({
      sessioneProduzioneId: activeTurnoId,
      lineaId: newSessionData.lineaId,
      articoloId: newSessionData.articoloId,
      siglaLottoId: newSessionData.siglaLottoId,
      dataIngresso: newSessionData.dataIngresso
    });

    const overlaps = conflictService.findConflicts(proposedSession.lineaId, activeSessions);
    if (overlaps.length > 0) {
      setPendingSession(proposedSession);
      setConflictingSessions(overlaps);
      setSelectedConflictsToClose(overlaps.map(o => o.id));
      return;
    }

    executeStartSession(proposedSession, []);
    } catch {
      return;
    }
  };

  const executeStartSession = (sessionToStart: SessioneLinea, idsToClose: string[]) => {
    const now = new Date().toISOString();
    setState(prev => {
      const updatedSessions = prev.lavorazioni.map(s =>
        idsToClose.includes(s.id) ? { ...s, fine: now, status: 'CHIUSA' as const } : s
      );
      updatedSessions.push(sessionToStart);
      return { ...prev, lavorazioni: updatedSessions };
    });
    setPendingSession(null);
    setConflictingSessions([]);
    setSelectedConflictsToClose([]);
  };

  const toggleConflictSelection = (id: string) => {
    setSelectedConflictsToClose(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleTogglePauseSession = (sessionId: string) => {
    const now = new Date().toISOString();
    const session = state.lavorazioni.find(s => s.id === sessionId);
    if (!session) return;

    if (session.status === 'PAUSA') {
      setState(prev => ({
        ...prev,
        lavorazioni: prev.lavorazioni.map(s => {
          if (s.id !== sessionId) return s;
          const newPause = [...s.pause];
          if (newPause.length > 0) newPause[newPause.length - 1].fine = now;
          return { ...s, status: 'ATTIVA', pause: newPause };
        })
      }));
    } else {
      setPausingTarget({ type: 'SESSION', id: sessionId });
    }
  };

  const handleCloseSession = async (sessionId: string) => {
    const confirmed = await showConfirm({ title: 'Chiudi Sessione', message: 'Terminare definitivamente la lavorazione?', variant: 'INFO' });
    if (!confirmed) return;
    setState(prev => ({ ...prev, lavorazioni: prev.lavorazioni.map(s => s.id === sessionId ? { ...s, fine: new Date().toISOString(), status: 'CHIUSA' as const } : s) }));
  };

  const handleDeleteSession = async (sessionId: string) => {
    const sessionPedane = state.pedane.filter(p => p.sessioneId === sessionId);
    const confirmed = await showConfirm({
      title: 'Elimina Sessione',
      message: sessionPedane.length > 0
        ? `Questa sessione contiene ${sessionPedane.length} pedane. Eliminando la sessione, verranno eliminate anche tutte le pedane collegate. Questa operazione non è reversibile. Continuare?`
        : 'Sei sicuro di voler eliminare definitivamente questa sessione?',
      variant: 'DANGER',
      confirmText: 'Elimina Tutto',
      cancelText: 'Annulla'
    });
    if (!confirmed) return;

    setState(prev => ({
      ...prev,
      lavorazioni: prev.lavorazioni.filter(s => s.id !== sessionId),
      pedane: prev.pedane.filter(p => p.sessioneId !== sessionId)
    }));
  };

  const handleEditSession = (session: SessioneLinea) => {
    setEditingSession(session);
    setEditSessionData({ articoloId: session.articoloId, siglaLottoId: session.siglaLottoId, dataIngresso: session.dataIngresso, note: session.note || '' });
    setIsEditSessionMode(true);
  };

  const handleSaveEditSession = async () => {
    if (!editingSession) return;

    const snapshotUpdates: Array<{ key: 'snapshotArticolo' | 'snapshotIngresso'; label: string; value: Pedana['snapshotArticolo'] | Pedana['snapshotIngresso'] }> = [];

    if (editSessionData.articoloId !== editingSession.articoloId) {
      const articolo = state.articoli.find(a => a.id === editSessionData.articoloId);
      if (articolo) {
        snapshotUpdates.push({
          key: 'snapshotArticolo',
          label: 'Articolo',
          value: { id: articolo.id, nome: articolo.nome, codice: articolo.codice }
        });
      }
    }

    if (
      editSessionData.siglaLottoId !== editingSession.siglaLottoId ||
      editSessionData.dataIngresso !== editingSession.dataIngresso
    ) {
      const lotto = state.sigleLotto.find(l => l.id === editSessionData.siglaLottoId);
      if (lotto) {
        snapshotUpdates.push({
          key: 'snapshotIngresso',
          label: 'Lotto Ingresso',
          value: {
            siglaLottoId: lotto.id,
            lottoCode: lotto.code,
            dataIngresso: editSessionData.dataIngresso
          }
        });
      }
    }

    const pedaneCollegate = state.pedane.filter(p => p.sessioneId === editingSession.id);
    let shouldUpdateSnapshots = false;

    if (pedaneCollegate.length > 0 && snapshotUpdates.length > 0) {
      const labels = snapshotUpdates.map(su => su.label).join(', ');
      shouldUpdateSnapshots = await showConfirm({
        title: 'Aggiorna Pedane Esistenti?',
        message: `Questa lavorazione ha ${pedaneCollegate.length} pedane già create. Stai modificando: ${labels}. Vuoi aggiornare anche i dati snapshot delle pedane?`,
        variant: 'INFO',
        confirmText: 'Sì, Aggiorna Tutte',
        cancelText: 'No, Mantieni Originali'
      });
    }

    setState(prev => ({
      ...prev,
      lavorazioni: prev.lavorazioni.map(s => s.id === editingSession.id ? { ...s, ...editSessionData } : s),
      pedane: shouldUpdateSnapshots
        ? prev.pedane.map(p => {
            if (p.sessioneId !== editingSession.id) return p;
            const patched: Pedana = { ...p };
            snapshotUpdates.forEach(su => {
              if (su.key === 'snapshotArticolo') {
                patched.snapshotArticolo = su.value as Pedana['snapshotArticolo'];
              }
              if (su.key === 'snapshotIngresso') {
                patched.snapshotIngresso = su.value as Pedana['snapshotIngresso'];
              }
            });
            return patched;
          })
        : prev.pedane
    }));

    setIsEditSessionMode(false);
    setEditingSession(null);
  };

  const handleOpenSwitchLotto = (session: SessioneLinea) => {
    setSessionToSwitchLotto(session);
    setSwitchLottoData({ siglaLottoId: session.siglaLottoId, dataIngresso: session.dataIngresso });
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
      lavorazioni: [...prev.lavorazioni.map(s => s.id === sessionToSwitchLotto.id ? { ...s, fine: now, status: 'CHIUSA' as const } : s), newSession]
    }));
    setSessionToSwitchLotto(null);
  };

  return {
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
  };
};
