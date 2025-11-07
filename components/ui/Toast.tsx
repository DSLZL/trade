import React from 'react';
import ReactDOM from 'react-dom';
import { cn } from '../../lib/utils';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
}

const toastTypeClasses = {
  success: 'bg-brand-green text-white',
  error: 'bg-brand-red text-white',
  warning: 'bg-yellow-500 text-white',
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  return ReactDOM.createPortal(
    <div
      className={cn(
        'fixed bottom-5 right-5 z-50 flex items-center justify-between w-full max-w-sm p-4 rounded-lg shadow-lg',
        toastTypeClasses[type]
      )}
      role="alert"
    >
      <div className="text-sm font-medium">{message}</div>
      <button
        onClick={onClose}
        type="button"
        className="ml-4 -mr-2 -my-2 p-1.5 rounded-md inline-flex items-center justify-center hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Dismiss"
      >
        <span className="sr-only">Dismiss</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>,
    document.body
  );
};

export { Toast };