import { useEffect, useMemo, useState } from 'react';
import { AppState } from '../types';
import { buildInitialState, normalizeLegacyState } from '../core/services/AppStateService';
import { LocalStorageAppStateRepository } from '../core/repositories/localStorage/LocalStorageAppStateRepository';
import { ValidationError } from '../core/errors/AppErrors';

export const useAppStateStore = () => {
  const repository = useMemo(() => new LocalStorageAppStateRepository(), []);
  const [state, setState] = useState<AppState>(buildInitialState);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await repository.load();
        if (data) {
          setState(normalizeLegacyState(data));
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          const raw = localStorage.getItem('agritrack_state');
          if (raw) {
            try {
              setState(normalizeLegacyState(JSON.parse(raw)));
              setLoadError('Dati legacy caricati con fallback: formato storage non pienamente valido.');
              return;
            } catch {
              // fallback to clean state below
            }
          }
        }
        setState(buildInitialState());
        setLoadError('Impossibile leggere lo stato salvato: ripristinato stato iniziale.');
      }
    };

    run();
  }, [repository]);

  useEffect(() => {
    repository.save(state).catch(() => {
      setLoadError('Errore durante il salvataggio automatico su localStorage.');
    });
  }, [state, repository]);

  return { state, setState, loadError, clearLoadError: () => setLoadError(null) };
};
