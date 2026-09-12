import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [incomingAlert, setIncomingAlert] = useState(null);

  useEffect(() => {
    // Only connect if user is logged in
    if (user && user._id) {
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        newSocket.emit('register_user', user._id);
      });

      newSocket.on('online_users_list', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('new_message_notification', (data) => {
        setIncomingAlert(data);
        setTimeout(() => setIncomingAlert(null), 5000);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      setSocket(null);
      setOnlineUsers([]);
    }
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      isUserOnline: (id) => onlineUsers.includes(id),
      incomingAlert,
      clearAlert: () => setIncomingAlert(null)
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
