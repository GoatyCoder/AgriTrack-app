import { Dispatch, SetStateAction, useMemo } from 'react';
import { AppState } from '../types';
import { DialogOptions } from '../components/DialogContext';
import { INITIAL_AREE } from '../constants';

interface Params {
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  activeTurnoId: string | null;
  setActiveTurnoId: (id: string | null) => void;
  setView: (view: 'HOME' | 'MONITOR' | 'REPORT' | 'SETTINGS') => void;
  showConfirm: (opts: DialogOptions) => Promise<boolean>;
  setPausingTarget: (target: { type: 'SHIFT' | 'SESSION'; id: string } | null) => void;
}

export const useTurnoActions = ({ state, setState, activeTurnoId, setActiveTurnoId, setView, showConfirm, setPausingTarget }: Params) => {
  const activeTurno = useMemo(() => state.turni.find(t => t.id === activeTurnoId), [state.turni, activeTurnoId]);

  const handleStartTurno = () => {
    const newTurno = {
      id: crypto.randomUUID(),
      inizio: new Date().toISOString(),
      operatore: 'Op. Principale',
      areaId: state.aree[0]?.id || INITIAL_AREE[0].id,
      status: 'APERTO' as const,
      pause: []
    };
    setState(prev => ({ ...prev, turni: [...prev.turni, newTurno] }));
    setActiveTurnoId(newTurno.id);
    setView('MONITOR');
  };

  const handleTogglePauseTurno = () => {
    if (!activeTurno) return;
    const isCurrentlyPaused = activeTurno.status === 'PAUSA';
    const now = new Date().toISOString();

    if (isCurrentlyPaused) {
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
      setPausingTarget({ type: 'SHIFT', id: activeTurno.id });
    }
  };

  const handleCloseTurno = async () => {
    const confirmed = await showConfirm({
      title: 'Chiudi Turno',
      message: 'Sei sicuro di voler chiudere il turno? Tutte le sessioni verranno terminate.',
      variant: 'DANGER'
    });
    if (!confirmed) return;
    const now = new Date().toISOString();
    setState(prev => ({
      ...prev,
      turni: prev.turni.map(t => t.id === activeTurnoId ? { ...t, fine: now, status: 'CHIUSO' } : t),
      sessioni: prev.sessioni.map(s => (s.turnoId === activeTurnoId && s.status !== 'CHIUSA') ? { ...s, fine: now, status: 'CHIUSA' } : s)
    }));
    setActiveTurnoId(null);
    setView('HOME');
  };

  return { activeTurno, handleStartTurno, handleTogglePauseTurno, handleCloseTurno };
};