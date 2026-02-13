import React from 'react';
import { DialogProvider } from '../../components/DialogContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <DialogProvider>{children}</DialogProvider>;
};
