
import { useState, useCallback } from 'react';
import { authAPI } from '../services/api'; // Or wherever authAPI is exported, likely services/api

/**
 * Hook to check subdomain availability
 */
export const useSubdomainCheck = () => {
    const [isChecking, setIsChecking] = useState(false);
    const [subdomainStatus, setSubdomainStatus] = useState(null); // 'available' | 'taken' | 'error' | null
    const [subdomainMessage, setSubdomainMessage] = useState('');

    const checkSubdomain = useCallback(async (subdomain) => {
        if (!subdomain || subdomain.length < 3) {
            setSubdomainStatus(null);
            setSubdomainMessage('');
            return;
        }

        setIsChecking(true);
        try {
            // Assuming there's an endpoint to check availability.
            // If not, we might need to mock or use a generic check.
            // authAPI.checkAvailability({ subdomain }) is standard.

            const response = await authAPI.checkAvailability({ subdomain });

            if (response.success && response.available) {
                setSubdomainStatus('available');
                setSubdomainMessage('Subdomain is available!');
            } else {
                setSubdomainStatus('taken');
                setSubdomainMessage(response.message || 'Subdomain is already taken.');
            }
        } catch (error) {
            console.error('Subdomain check error:', error);
            setSubdomainStatus('error');
            setSubdomainMessage('Could not verify subdomain.');
        } finally {
            setIsChecking(false);
        }
    }, []);

    return {
        isChecking,
        subdomainStatus,
        subdomainMessage,
        checkSubdomain,
        resetSubdomainCheck: () => {
            setSubdomainStatus(null);
            setSubdomainMessage('');
        }
    };
};
