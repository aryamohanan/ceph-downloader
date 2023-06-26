export class NotifierDownloadEventPayload {
    messageBody: string;
    messageTitle: string;
    filePath: string;
    orgUrn: string;

    constructor(event: any){
        this.messageBody = event.messageBody;
        this.messageTitle = event.messageTitle;
        this.filePath = event.filePath;
        this.orgUrn = event.orgUrn;
    }
}