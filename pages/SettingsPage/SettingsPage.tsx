import React from 'react';
import SettingsDashboard from '../../components/SettingsDashboard';
import { AppState } from '../../types';

export const SettingsPage: React.FC<{ data: AppState; onUpdateData: (newData: Partial<AppState>) => void }> = ({ data, onUpdateData }) => {
  return <SettingsDashboard data={data} onUpdateData={onUpdateData} />;
};
