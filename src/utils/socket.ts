import { Server, ServerOptions } from 'socket.io';
import * as http from 'http';
import { ISocketResponse, IWidgetCliSocket } from '../interface/socket';
import { SocketType } from '../enum';

const SOCKET_PATH_DEFAULT = 'widget-cli:sockjs-node';

const emitMessage = (socket: Server, response: ISocketResponse) => {
  socket.emit(SOCKET_PATH_DEFAULT, response);
};

class WidgetCliSocket implements IWidgetCliSocket {
  widgetCliSocket: Server;
  constructor(server: http.Server | number, serverOptions?: ServerOptions) {
    const baseServerOptions = {
      path: `/${SOCKET_PATH_DEFAULT}`,
      allowEIO3: true,
      cors: {
        origin: true,
        credentials: true
      }
    };
    // init socket service
    this.widgetCliSocket = new Server(server, {
      ...baseServerOptions,
      ...serverOptions
    });
  }

  liveReload() {
    emitMessage(this.widgetCliSocket, { type: SocketType.LiveReload });
  }
}

let widgetCliSocket: IWidgetCliSocket;

export const createWidgetCliSocket = (server: http.Server, serverOptions?: ServerOptions) => {
  if (!widgetCliSocket) {
    widgetCliSocket = new WidgetCliSocket(server, serverOptions);
  }
  return widgetCliSocket;
};
