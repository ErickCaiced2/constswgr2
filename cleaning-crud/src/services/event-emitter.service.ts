import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EventEmitterService {
  private readonly eventHubUrl = 'http://localhost:3000/events';

  async emitEvent(
    action: string,
    entity: string,
    title: string,
    description: string,
    payload: any,
  ) {
    try {
      const event = {
        source: 'cleaning-crud',
        entity: entity,
        action: action,
        title: title,
        description: description,
        payload: payload,
      };

      const response = await axios.post(this.eventHubUrl, event);
      console.log(
        `✅ Event [${action}] registered:`,
        response.data || 'Success',
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `❌ Error emitting event [${action}]:`,
        errorMessage,
      );
      // No lanzamos el error para que el CRUD siga funcionando aunque el Event Manager falle
    }
  }
}

