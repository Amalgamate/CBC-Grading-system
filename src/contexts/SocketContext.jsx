
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { API_BASE_URL } from '../services/axiosConfig';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    // Clean URL to base domain/port
    const SOCKET_URL = API_BASE_URL.replace(/\/api$/, '');

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            const newSocket = io(SOCKET_URL, {
                auth: { token },
                reconnection: true,
                reconnectionAttempts: 5
            });

            newSocket.on('connect', () => {
                console.log('Socket connected');
            });

            newSocket.on('error', (err) => {
                console.error('Socket error:', err);
            });

            setSocket(newSocket);

            return () => newSocket.close();
        }
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
