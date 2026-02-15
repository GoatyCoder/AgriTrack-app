import { ITurnoRepository } from '../../repositories/interfaces/ITurnoRepository';
import { ISessioneRepository } from '../../repositories/interfaces/ISessioneRepository';
import { SessioneProduzione } from '../../../types';

export class SessioneProduzioneApplicationService {
  constructor(private turnoRepo: ITurnoRepository, private sessioneRepo: ISessioneRepository) {}

  async startSessioneProduzione(operatore: string, areaId: string): Promise<SessioneProduzione> {
    const active = await this.turnoRepo.getActive();
    if (active) throw new Error('R1.1: SessioneProduzione già attivo');

    const turno: SessioneProduzione = {
      id: crypto.randomUUID(),
      inizio: new Date().toISOString(),
      operatore,
      areaId,
      status: 'APERTO',
      pause: []
    };

    return this.turnoRepo.create(turno);
  }

  async closeSessioneProduzione(sessioneProduzioneId: string): Promise<void> {
    const turno = await this.turnoRepo.getById(sessioneProduzioneId);
    if (!turno) throw new Error('SessioneProduzione non trovato');

    const now = new Date().toISOString();
    const sessioni = await this.sessioneRepo.getBySessioneProduzione(sessioneProduzioneId);
    for (const s of sessioni.filter(x => x.status !== 'CHIUSA')) {
      await this.sessioneRepo.update({ ...s, status: 'CHIUSA', fine: now });
    }

    await this.turnoRepo.update({ ...turno, status: 'CHIUSO', fine: now });
  }
}
