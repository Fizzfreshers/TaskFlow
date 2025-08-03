import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext'; // To get user ID

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user, token } = useContext(AuthContext); // Get user and token from AuthContext

    useEffect(() => {
        if (user && token && !socket) {
            const newSocket = io('${process.env.REACT_APP_API_URL}', {
                query: { token }, // You can pass token for authentication here if needed
            });

            newSocket.on('connect', () => {
                console.log('Socket Connected:', newSocket.id);
                // Emit user online status and join room
                newSocket.emit('userOnline', user._id);
                newSocket.emit('joinRoom', user._id); // Each user joins a room named after their ID
                console.log(`User ${user._id} joined room ${user._id}`);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket Disconnected');
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket Connection Error:', err.message);
            });

            setSocket(newSocket);

            // Clean up on component unmount or user logout
            return () => {
                if (newSocket) {
                    newSocket.disconnect();
                    setSocket(null);
                }
            };
        } else if (!user && socket) {
            // If user logs out, disconnect socket
            socket.disconnect();
            setSocket(null);
        }
    }, [user, token]); // Re-run effect if user or token changes

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};