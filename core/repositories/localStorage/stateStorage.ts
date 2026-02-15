import { AppState } from '../../../types';
import { DataAccessError } from '../../errors/AppErrors';
import { buildInitialState, normalizeLegacyState } from '../../services/AppStateService';

const DEFAULT_KEY = 'agritrack_state';

export const readState = (storageKey = DEFAULT_KEY): AppState => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return buildInitialState();
    return normalizeLegacyState(JSON.parse(raw));
  } catch (error) {
    throw new DataAccessError('Failed to read state from localStorage', error);
  }
};

export const writeState = (state: AppState, storageKey = DEFAULT_KEY): void => {
  try {
    const normalizedState: AppState = {
      ...state,
      sessioniProduzione: state.sessioniProduzione?.length ? state.sessioniProduzione : state.turni,
      lavorazioni: state.lavorazioni?.length ? state.lavorazioni : state.sessioni,
      prodottiGrezzi: state.prodottiGrezzi?.length ? state.prodottiGrezzi : state.prodotti,
      turni: state.turni?.length ? state.turni : state.sessioniProduzione,
      sessioni: state.sessioni?.length ? state.sessioni : state.lavorazioni,
      prodotti: state.prodotti?.length ? state.prodotti : state.prodottiGrezzi
    };
    localStorage.setItem(storageKey, JSON.stringify(normalizedState));
  } catch (error) {
    throw new DataAccessError('Failed to write state to localStorage', error);
  }
};
