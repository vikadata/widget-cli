import { Server } from 'socket.io'
import { SocketType } from "../enum";

export interface IWidgetCliSocket {
  widgetCliSocket: Server;
  liveReload: () => void;
}

export interface ISocketResponse {
  type: SocketType;
  data?: null
}
