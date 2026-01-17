/**
 * Toast Notification Component
 * Display temporary notification messages
 */

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ show, message, type = 'success', onClose }) => {
  if (!show) return null;

  const styles = {
    success: {
      bg: 'bg-green-600',
      icon: CheckCircle
    },
    error: {
      bg: 'bg-red-600',
      icon: XCircle
    },
    warning: {
      bg: 'bg-orange-600',
      icon: AlertCircle
    },
    info: {
      bg: 'bg-blue-600',
      icon: Info
    }
  };

  const config = styles[type] || styles.success;
  const Icon = config.icon;

  return (
    <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg transition ${config.bg} text-white z-50 animate-slide-up`}>
      <div className="flex items-center gap-3">
        <Icon size={20} />
        <span className="font-medium">{message}</span>
        {onClose && (
          <button 
            onClick={onClose}
            className="ml-2 hover:opacity-80 transition"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
