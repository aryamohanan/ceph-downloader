import { KafkaMessage } from "@models/KafkaMessage";
import { DownloaderEvent } from "@models/DownloaderEvent";
import { MessageProcessingEvents } from "@services/kafka/consumer";
import { Logger } from "@services/logger";
import events = require("events");
import { IEventHandler } from "./IEventHandler";
import { ProcessFileUpload } from "./processFileUpload";
import { ServiceOutageCodes, CephOutageCode } from "@models/Enums/ServiceOutageCodes";
import { EventType } from "@models/Enums/EventTypes";
import { GrayLogSearchQueries } from "@models/Enums/GrayLogSearchQueries";
import { ProcessNotification } from "./Exceptions/processNotification";
import { NotifierEventPayload } from "@models/NotifierEventPayload";
import { Requests } from "@models/Requests";

export class EventHandler extends events.EventEmitter {
  static eventHandlers: Array<IEventHandler> = [
    new ProcessFileUpload()
  ];
  async call(kafkaMessage: KafkaMessage) {
    try {
      const downloaderEvent = DownloaderEvent.fromString(kafkaMessage.value);
      const eventHandler = EventHandler.eventHandlers.find((item) =>
        item.isType(downloaderEvent?.eventType)
      );
      if (eventHandler){
        Logger.logInfo("EventHandler","call", "Event received: " + JSON.stringify(downloaderEvent));
        await eventHandler.call(downloaderEvent);
        this.emit(MessageProcessingEvents.finished, kafkaMessage);
      }
    } catch (error) {
      Logger.errorLog("EventHandler", "call", error);
      if(error.message.includes(CephOutageCode)){
        const message = error.message;
        const eventDetails = {
            eventName: "CEPH api call failed",
            eventType: EventType.API_CALL_FAILED,
            message: message,
            grayLogSearchQuery: GrayLogSearchQueries.CEPH_OUTAGE_EXCEPTION,
        };
        await this.generateNotification(eventDetails);
        this.emit(MessageProcessingEvents.cephOutage, kafkaMessage);
      }
      else if(ServiceOutageCodes.includes(error.code)){
        this.emit(MessageProcessingEvents.provisioningDatabaseOutage, kafkaMessage);
      }
      else{
        this.emit(MessageProcessingEvents.failed, kafkaMessage);
      }
    }
  }
  async generateNotification(eventDetails: any) {
    const notifierEventPayload = new NotifierEventPayload(eventDetails.message, eventDetails.grayLogSearchQuery)
    const notifierEvent = {
        eventName: eventDetails.eventName,
        eventType: eventDetails.eventType,
        happenedOn: new Date(),
        payload: notifierEventPayload
    };
    const processNotification = new ProcessNotification();
    await processNotification.call(notifierEvent);
}
}