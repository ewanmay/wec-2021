import Socket from 'socket.io-client'
export const socket: SocketIOClient.Socket = Socket('http://localhost:5000');

