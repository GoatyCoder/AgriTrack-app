import { SessioneLinea } from '../../../types';
import { ISessioneRepository } from '../interfaces/ISessioneRepository';
import { readState, writeState } from './stateStorage';

export class LocalStorageSessioneRepository implements ISessioneRepository {
  async getAll(): Promise<SessioneLinea[]> {
    return readState().lavorazioni;
  }

  async getById(id: string): Promise<SessioneLinea | null> {
    return (await this.getAll()).find(s => s.id === id) || null;
  }

  async getByTurno(sessioneProduzioneId: string): Promise<SessioneLinea[]> {
    return (await this.getAll()).filter(s => s.sessioneProduzioneId === sessioneProduzioneId);
  }

  async getActiveByLinea(lineaId: string): Promise<SessioneLinea[]> {
    return (await this.getAll()).filter(s => s.lineaId === lineaId && s.status !== 'CHIUSA');
  }

  async create(sessione: SessioneLinea): Promise<SessioneLinea> {
    const state = readState();
    state.lavorazioni.push(sessione);
    writeState(state);
    return sessione;
  }

  async update(sessione: SessioneLinea): Promise<SessioneLinea> {
    const state = readState();
    state.lavorazioni = state.lavorazioni.map(s => (s.id === sessione.id ? sessione : s));
    writeState(state);
    return sessione;
  }

  async delete(id: string): Promise<void> {
    const state = readState();
    state.lavorazioni = state.lavorazioni.filter(s => s.id !== id);
    writeState(state);
  }
}
