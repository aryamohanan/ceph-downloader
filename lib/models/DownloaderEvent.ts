import { Logger } from "@services/logger";

export class DownloaderEvent {
  requestURNs: any;
  eventType: string;
  public static fromString(jsonString: string) {
    const downloaderEvent = new DownloaderEvent();
    try {
      const json = JSON.parse(jsonString);
      downloaderEvent.eventType = json?.EventType;
      downloaderEvent.requestURNs = json?.RequestURNs;
    } catch (error) {
      Logger.errorLog("DownloaderEvent","fromString",`Failed to parse message to Notifier Event. ${error.stack}`);
      throw new error(error);
    }
    return downloaderEvent;
  }
}