import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { MedicionService } from '../medicion/medicion.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MedicionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MedicionGateway.name);

  constructor(private readonly medicionService: MedicionService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway inicializado');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('subscribe_mediciones')
  handleSubscribeMediciones(client: Socket, payload: { sensorId: string }) {
    const { sensorId } = payload;
    client.join(`sensor_${sensorId}`);
    this.logger.log(`Cliente ${client.id} subscribe a sensor ${sensorId}`);
    return { event: 'subscribed', data: { sensorId } };
  }

  @SubscribeMessage('unsubscribe_mediciones')
  handleUnsubscribeMediciones(client: Socket, payload: { sensorId: string }) {
    const { sensorId } = payload;
    client.leave(`sensor_${sensorId}`);
    this.logger.log(`Cliente ${client.id} unsubscribe de sensor ${sensorId}`);
    return { event: 'unsubscribed', data: { sensorId } };
  }

  async emitNuevaMedicion(sensorId: string, medicion: any) {
    this.server.to(`sensor_${sensorId}`).emit('medicion:new', {
      sensorId,
      medicion,
    });
  }
}