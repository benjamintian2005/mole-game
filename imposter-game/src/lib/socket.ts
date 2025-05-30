import io from 'socket.io-client';
import type { SocketType } from '@/types/game';

let socket: any;

export const initSocket = (): any => {
  if (!socket) {
    socket = io(process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_SERVER_URL || ''
      : 'http://localhost:3000'
    );
  }
  return socket;
};

export const getSocket = (): any => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initSocket() first.');
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
  }
};