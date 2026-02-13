import { ITurnoRepository } from '../../repositories/interfaces/ITurnoRepository';
import { ISessioneRepository } from '../../repositories/interfaces/ISessioneRepository';
import { Turno } from '../../../types';

export class TurnoApplicationService {
  constructor(private turnoRepo: ITurnoRepository, private sessioneRepo: ISessioneRepository) {}

  async startTurno(operatore: string, areaId: string): Promise<Turno> {
    const active = await this.turnoRepo.getActive();
    if (active) throw new Error('R1.1: Turno già attivo');

    const turno: Turno = {
      id: crypto.randomUUID(),
      inizio: new Date().toISOString(),
      operatore,
      areaId,
      status: 'APERTO',
      pause: []
    };

    return this.turnoRepo.create(turno);
  }

  async closeTurno(turnoId: string): Promise<void> {
    const turno = await this.turnoRepo.getById(turnoId);
    if (!turno) throw new Error('Turno non trovato');

    const now = new Date().toISOString();
    const sessioni = await this.sessioneRepo.getByTurno(turnoId);
    for (const s of sessioni.filter(x => x.status !== 'CHIUSA')) {
      await this.sessioneRepo.update({ ...s, status: 'CHIUSA', fine: now });
    }

    await this.turnoRepo.update({ ...turno, status: 'CHIUSO', fine: now });
  }
}
