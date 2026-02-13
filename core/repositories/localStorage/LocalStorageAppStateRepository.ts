import { IAppStateRepository } from '../interfaces/IAppStateRepository';
import { AppState } from '../../../types';
import { DataAccessError, ValidationError } from '../../errors/AppErrors';
import { AppStateSchema } from '../../validators/schemas';

export class LocalStorageAppStateRepository implements IAppStateRepository {
  constructor(private readonly storageKey = 'agritrack_state') {}

  async load(): Promise<AppState | null> {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const validation = AppStateSchema.safeParse(parsed);
      if (!validation.success) {
        throw new ValidationError('Invalid app state in storage', validation.error.flatten());
      }
      return validation.data as AppState;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DataAccessError('Failed to load app state from localStorage', error);
    }
  }

  async save(state: AppState): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (error) {
      throw new DataAccessError('Failed to save app state to localStorage', error);
    }
  }
}
