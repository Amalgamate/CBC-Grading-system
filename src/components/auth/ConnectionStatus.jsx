import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../services/api';

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      setIsChecking(true);
      try {
        // Health endpoint is at /health, not /api/health
        const backendBaseUrl = API_BASE_URL.replace('/api', '');
        const healthUrl = `${backendBaseUrl}/health`;
        
        console.log('🔍 Checking connection to:', healthUrl);
        
        const response = await fetch(healthUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        console.log('📡 Health check response:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Health check data:', data);
          setIsConnected(true);
          setError(null);
        } else {
          console.warn('⚠️ Health check failed with status:', response.status);
          setIsConnected(false);
          setError(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('❌ Connection check error:', error.message);
        setIsConnected(false);
        setError(error.message);
      } finally {
        setIsChecking(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const statusColor = isConnected ? 'bg-green-500' : 'bg-red-500';
  const statusText = isConnected ? 'Connected' : 'Disconnected';
  const statusBgColor = isConnected ? 'bg-green-50' : 'bg-red-50';
  const statusBorder = isConnected ? 'border-green-200' : 'border-red-200';

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${statusBgColor} border ${statusBorder} text-sm`}>
      <div className={`${statusColor} w-2.5 h-2.5 rounded-full ${isChecking ? 'animate-pulse' : ''}`}></div>
      <span className={`font-medium ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
        {statusText}
      </span>
      {isChecking && <span className="text-xs text-gray-500 ml-auto">Checking...</span>}
      {!isChecking && !isConnected && error && (
        <span className="text-xs text-red-600 ml-auto">{error}</span>
      )}
    </div>
  );
}
