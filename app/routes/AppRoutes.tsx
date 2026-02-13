import React from 'react';
import { HomePage } from '../../pages/HomePage';
import { ReportPage } from '../../pages/ReportPage';
import { SettingsPage } from '../../pages/SettingsPage';
import { AppState, Articolo } from '../../types';

interface AppRoutesProps {
  view: 'HOME' | 'MONITOR' | 'REPORT' | 'SETTINGS';
  onStartTurno: () => void;
  onGoReport: () => void;
  onGoSettings: () => void;
  monitorNode: React.ReactNode;
  state: AppState;
  articoli: Articolo[];
  onUpdateData: (newData: Partial<AppState>) => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  view,
  onStartTurno,
  onGoReport,
  onGoSettings,
  monitorNode,
  state,
  articoli,
  onUpdateData
}) => {
  if (view === 'HOME') return <HomePage onStartTurno={onStartTurno} onGoReport={onGoReport} onGoSettings={onGoSettings} />;
  if (view === 'REPORT') return <ReportPage data={state} articoli={articoli} />;
  if (view === 'SETTINGS') return <SettingsPage data={state} onUpdateData={onUpdateData} />;
  return <>{monitorNode}</>;
};
