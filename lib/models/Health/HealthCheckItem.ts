import { Status } from "@models/Enums/Status";
import { Logger } from "@services/logger";

export class HealthCheckItem {

    name: string;
    status: string;
    details: string;
    properties: JSON;
    descriptionHref: string;

    constructor(jsonstring: string) {
        try {
            const jsonValue = JSON.parse(jsonstring);
            this.name = jsonValue.name;
            this.status = jsonValue.status;
            this.details = jsonValue.details;
            this.properties = jsonValue.properties;
            this.descriptionHref = jsonValue.descriptionHref;
        } catch (error) {
            Logger.error(`Failed to parse Health Check Item`,error)
        }
    }
    get isValid(): boolean {
        return !!(this.name && this.status);
    };

    public setHealthStatus = (status: Status, details) => {
        this.status = Status[status];
        this.details = details;
    }
}
