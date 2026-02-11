import { Pedana } from './types';

export const generateStickerCode = (pedaneCountToday: number): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  
  // Calculate Day of Year (DOY)
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  const doy = day.toString().padStart(3, '0');
  
  const sequence = (pedaneCountToday + 1).toString();
  
  return `P${year}-${doy}-${sequence}`;
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

// Helper per aggiornare l'orario mantenendo la data originale
export const updateIsoTime = (originalIso: string, newTimeHHMM: string): string => {
  if (!originalIso || !newTimeHHMM) return originalIso;
  
  const originalDate = new Date(originalIso);
  const [hours, minutes] = newTimeHHMM.split(':').map(Number);
  
  // Creiamo una nuova data basata sull'originale
  const newDate = new Date(originalDate);
  newDate.setHours(hours);
  newDate.setMinutes(minutes);
  // Opzionale: azzeriamo i secondi per pulizia, o li lasciamo
  newDate.setSeconds(0);
  newDate.setMilliseconds(0);
  
  return newDate.toISOString();
};