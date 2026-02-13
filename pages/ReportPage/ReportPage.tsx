import React from 'react';
import ReportDashboard from '../../components/ReportDashboard';
import { AppState, Articolo } from '../../types';

export const ReportPage: React.FC<{ data: AppState; articoli: Articolo[] }> = ({ data, articoli }) => {
  return <ReportDashboard data={data} articolis={articoli} />;
};
