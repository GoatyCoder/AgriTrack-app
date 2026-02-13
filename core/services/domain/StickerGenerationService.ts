import { Pedana } from '../../../types';
import { computeDoy } from '../../../utils';

export class StickerGenerationService {
  generateNext(pedaneToday: Pedana[], date = new Date()): { code: string; doy: number; seq: number } {
    const year = date.getFullYear().toString().slice(-2);
    const doy = computeDoy(date);
    const seq = pedaneToday.length + 1;
    const paddedDoy = doy.toString().padStart(3, '0');
    return {
      code: `P${year}-${paddedDoy}-${seq}`,
      doy,
      seq
    };
  }
}
