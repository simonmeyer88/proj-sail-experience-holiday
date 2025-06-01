import { Socket } from 'socket.io';

export interface IMessage {
  id: string;
  content: string;
  sender: {
    pictureUrl: string;
    fullName: string;
    id: string;
  };
  sentAt: string | Date;
  chatId: string;
  deletedAt?: string | Date;
}

export interface ServerToClientEvents {
  message: (payload: IMessage) => void;
  deleteMessage: (payload: { id: string; chatId: string }) => void;
}

export interface SocketData {
  authToken: string;
  userId: string;
}

export type CustomSocket = Socket<any, ServerToClientEvents, any, SocketData>;
