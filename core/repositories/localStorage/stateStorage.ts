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
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    throw new DataAccessError('Failed to write state to localStorage', error);
  }
};
