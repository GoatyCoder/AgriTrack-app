import { Pedana } from './types';

export const computeDoy = (date = new Date()): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

export const generateStickerData = (pedaneCountToday: number): { stickerCode: string; doy: number; seq: number } => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const doy = computeDoy(now);
  const seq = pedaneCountToday + 1;
  const doyLabel = doy.toString().padStart(3, '0');

  return {
    stickerCode: `P${year}-${doyLabel}-${seq}`,
    doy,
    seq
  };
};

export const formatDateTime = (isoString: string) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatTime = (isoString: string) => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const updateIsoTime = (originalIso: string, newTimeHHMM: string): string => {
  if (!originalIso || !newTimeHHMM) return originalIso;

  const originalDate = new Date(originalIso);
  const [hours, minutes] = newTimeHHMM.split(':').map(Number);

  const newDate = new Date(originalDate);
  newDate.setHours(hours);
  newDate.setMinutes(minutes);
  newDate.setSeconds(0);
  newDate.setMilliseconds(0);

  return newDate.toISOString();
};
