export class NotifierEvent {
    payload: any;
    eventName: string;
    eventType: string;
    happenedOn: Date;
    eventDateTimeUTC: Date;
    triggeredBy: string;
    static setEvent(event: any): NotifierEvent {
      const notifierEvent = new NotifierEvent();
      notifierEvent.eventName = event?.eventName;
      notifierEvent.eventType = event?.eventType;
      notifierEvent.happenedOn = event?.happenedOn || new Date();
      notifierEvent.eventDateTimeUTC = new Date();
      notifierEvent.payload = event?.payload;
      notifierEvent.triggeredBy = process.env.serviceName;
      return notifierEvent;
    }
    get keyBuffer(): Buffer {
      return Buffer.from(this.eventName);
    }
    get isValid(): boolean {
      return !!this.eventName;
    }
    get valueBuffer(): Buffer {
      return Buffer.from(JSON.stringify(this));
    }
  }