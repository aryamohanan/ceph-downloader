import { KafkaStatus } from '@useCases/Health/kafkaStatus';
import { Request, Response } from 'express';
import { Status } from '@models/Enums/Status';

export class HealthStatusController {
    async show(request: Request, response: Response) {
        const appHealth = {
            appStatus: 'alive',
            hash: process.env.ShortHash
        }
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(appHealth));
    }
    async show1(request: Request, response: Response) {
        const kafka = new KafkaStatus();
        const kafkaHealth = await kafka.connect();
        const health =
        {
            service_name: process.env.serviceName,
            version: '0.1',
            container_id: '',
            hostname: '',
            properties: {
                hash: process.env.ShortHash
            },
            items: [kafkaHealth]
        }
        const status: number = parseInt(Status[kafkaHealth.status]);
        response.status(status)
        response.json(health).end();
    }
}