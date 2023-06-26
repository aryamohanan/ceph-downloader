export class NotifierEventPayload {
    message: string;
    grayLogSearchQuery: string;

    constructor(message: string, searchQuery: string){
        this.grayLogSearchQuery = searchQuery;
        this.message = message;
    }
}