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
  const activeTurno = useMemo(
    () => state.sessioniProduzione.find((sessioneProduzione) => sessioneProduzione.id === activeTurnoId),
    [state.sessioniProduzione, activeTurnoId]
  );

  const handleStartTurno = () => {
    const newTurno = {
      id: crypto.randomUUID(),
      inizio: new Date().toISOString(),
      operatore: 'Op. Principale',
      areaId: state.aree[0]?.id || INITIAL_AREE[0].id,
      status: 'APERTO' as const,
      pause: []
    };

    setState((prev) => ({ ...prev, sessioniProduzione: [...prev.sessioniProduzione, newTurno] }));
    setActiveTurnoId(newTurno.id);
    setView('MONITOR');
  };

  const handleTogglePauseTurno = () => {
    if (!activeTurno) return;
    const isCurrentlyPaused = activeTurno.status === 'PAUSA';
    const now = new Date().toISOString();

    if (isCurrentlyPaused) {
      setState((prev) => {
        const updatedSessioniProduzione = prev.sessioniProduzione.map((sessioneProduzione) => {
          if (sessioneProduzione.id !== activeTurnoId) return sessioneProduzione;
          const pauseAggiornate = [...sessioneProduzione.pause];
          if (pauseAggiornate.length > 0) pauseAggiornate[pauseAggiornate.length - 1].fine = now;
          return { ...sessioneProduzione, status: 'APERTO' as const, pause: pauseAggiornate };
        });

        const updatedLavorazioni = prev.lavorazioni.map((lavorazione) => {
          if (lavorazione.sessioneProduzioneId !== activeTurnoId || lavorazione.status !== 'PAUSA') return lavorazione;
          const pauseAggiornate = [...lavorazione.pause];
          if (pauseAggiornate.length > 0) pauseAggiornate[pauseAggiornate.length - 1].fine = now;
          return { ...lavorazione, status: 'ATTIVA' as const, pause: pauseAggiornate };
        });

        return { ...prev, sessioniProduzione: updatedSessioniProduzione, lavorazioni: updatedLavorazioni };
      });
      return;
    }

    setPausingTarget({ type: 'SHIFT', id: activeTurno.id });
  };

  const handleCloseTurno = async () => {
    const confirmed = await showConfirm({
      title: 'Chiudi Sessione Produzione',
      message: 'Sei sicuro di voler chiudere la sessione produzione? Tutte le lavorazioni verranno terminate.',
      variant: 'DANGER'
    });
    if (!confirmed) return;

    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      sessioniProduzione: prev.sessioniProduzione.map((sessioneProduzione) =>
        sessioneProduzione.id === activeTurnoId ? { ...sessioneProduzione, fine: now, status: 'CHIUSO' } : sessioneProduzione
      ),
      lavorazioni: prev.lavorazioni.map((lavorazione) =>
        lavorazione.sessioneProduzioneId === activeTurnoId && lavorazione.status !== 'CHIUSA'
          ? { ...lavorazione, fine: now, status: 'CHIUSA' }
          : lavorazione
      )
    }));

    setActiveTurnoId(null);
    setView('HOME');
  };

  return { activeTurno, handleStartTurno, handleTogglePauseTurno, handleCloseTurno };
};
