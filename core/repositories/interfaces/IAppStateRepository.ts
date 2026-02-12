import { AppState } from '../../../types';

export interface IAppStateRepository {
  load(): Promise<AppState | null>;
  save(state: AppState): Promise<void>;
}
