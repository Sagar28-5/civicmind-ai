import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

const playNotificationChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Web Audio API fallback ignore
  }
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    const newSocket = io(backendUrl, { autoConnect: true });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected to server');
      if (user?._id) {
        newSocket.emit('join_user', user._id);
        newSocket.emit('join_role', user.role);
      }
    });

    newSocket.on('complaint_updated', (data) => {
      playNotificationChime();
      const noteItem = {
        id: Date.now(),
        title: `Complaint Updated: ${data.title || 'Civic Ticket'}`,
        message: `Status changed to ${data.status.replace('_', ' ').toUpperCase()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        data,
      };
      setNotifications((prev) => [noteItem, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast.success(`Complaint status updated: ${data.status.replace('_', ' ')}`, { icon: '🔔' });
    });

    newSocket.on('new_complaint', (data) => {
      if (user?.role === 'admin' || user?.role === 'officer') {
        playNotificationChime();
        const noteItem = {
          id: Date.now(),
          title: `New Ticket: ${data.title}`,
          message: `Category: ${data.category?.toUpperCase()} | Priority: ${data.priority?.toUpperCase()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          data,
        };
        setNotifications((prev) => [noteItem, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast.info(`New Issue Reported: ${data.title}`, { icon: '🚨' });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};
