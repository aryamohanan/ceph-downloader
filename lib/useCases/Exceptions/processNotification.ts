import { Configurations } from "@config";
import { NotifierEvent } from "@models/NotifierEvent";
import { GetKafkaProducer, ProduceKafkaMessage } from "@services/kafka/produceMessage";
import { Logger } from "@services/logger";

export class ProcessNotification {
  private produceKafkaMessage: ProduceKafkaMessage;
  async call(event: any) {
    const notifierEvent = NotifierEvent.setEvent(event);
    if (notifierEvent.isValid)   
      await this.publish(notifierEvent);
  }
  async publish(notifierEvent: NotifierEvent) {
    await this.setProduceKafkaInstance();
     this.produceKafkaMessage
      .call(notifierEvent, Configurations.notificationKafkaTopic)
       .then((result) =>
        Logger.logDetails(
          "ProcessNotification.publish",
          `Event ${
            notifierEvent.eventName
          } published to kafka for event: ${JSON.stringify(notifierEvent)}`
        )
      )
      .catch((error) => {
        Logger.error(
          "ProcessNotification.publish",
          `Error occured while publishing event ${
            notifierEvent.eventName
          }, event:${JSON.stringify(notifierEvent)}. Error: ${error}`
        );
      });
  }
   async setProduceKafkaInstance() {
    if (!this.produceKafkaMessage) {
      const producer = await GetKafkaProducer.call();
      this.produceKafkaMessage = new ProduceKafkaMessage(producer);
    }
  }
}