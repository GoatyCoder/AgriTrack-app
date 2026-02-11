import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

type DialogType = 'ALERT' | 'CONFIRM';
type DialogVariant = 'INFO' | 'DANGER' | 'SUCCESS';

interface DialogOptions {
  title: string;
  message: string;
  variant?: DialogVariant;
  confirmText?: string;
  cancelText?: string;
}

interface DialogContextProps {
  showAlert: (options: DialogOptions) => Promise<void>;
  showConfirm: (options: DialogOptions) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextProps | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<DialogOptions>({ title: '', message: '' });
  const [type, setType] = useState<DialogType>('ALERT');
  
  // Refs to store the resolve functions of the promises
  const resolveRef = useRef<(value: boolean | void | PromiseLike<boolean | void>) => void>(() => {});

  const showAlert = useCallback((options: DialogOptions): Promise<void> => {
    return new Promise((resolve) => {
      setConfig({ ...options, variant: options.variant || 'INFO' });
      setType('ALERT');
      setIsOpen(true);
      resolveRef.current = resolve as any;
    });
  }, []);

  const showConfirm = useCallback((options: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfig({ ...options, variant: options.variant || 'INFO' });
      setType('CONFIRM');
      setIsOpen(true);
      resolveRef.current = resolve as any;
    });
  }, []);

  const handleClose = (result: boolean) => {
    setIsOpen(false);
    resolveRef.current(result);
  };

  // UI Components helpers
  const getIcon = () => {
    if (config.variant === 'DANGER') return <AlertTriangle className="text-red-600" size={32} />;
    if (config.variant === 'SUCCESS') return <CheckCircle className="text-agri-600" size={32} />;
    return <Info className="text-blue-600" size={32} />;
  };

  const getButtonColor = () => {
    if (config.variant === 'DANGER') return 'bg-red-600 hover:bg-red-700';
    return 'bg-agri-600 hover:bg-agri-700';
  };

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {/* Global Dialog Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" onClick={() => type === 'ALERT' && handleClose(false)} />
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-3 rounded-full ${config.variant === 'DANGER' ? 'bg-red-100' : config.variant === 'SUCCESS' ? 'bg-agri-100' : 'bg-blue-100'}`}>
                  {getIcon()}
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{config.title}</h3>
                  <p className="text-gray-500 mt-2 text-sm leading-relaxed">{config.message}</p>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                {type === 'CONFIRM' && (
                  <button
                    onClick={() => handleClose(false)}
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {config.cancelText || 'Annulla'}
                  </button>
                )}
                
                <button
                  onClick={() => handleClose(true)}
                  className={`flex-1 px-4 py-2 text-white font-bold rounded-lg shadow-md transition-colors ${getButtonColor()}`}
                >
                  {config.confirmText || (type === 'ALERT' ? 'OK' : 'Conferma')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};