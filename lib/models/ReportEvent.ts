import { Logger } from "@services/logger";
import { ReportNameTypes, ReportTypes } from "./Enums/ReportTypes";

export class ReportEvent {
    reportName: ReportNameTypes;
    reportType: ReportTypes;
    filter: any;
    public static fromString(jsonString: string) {
        const reportEvent = new ReportEvent();
        try {
        const json = JSON.parse(jsonString);
        reportEvent.reportName = json?.reportName;
        reportEvent.reportType = json?.reportType;
        reportEvent.filter = json?.filter;
    } catch (error) {
        Logger.errorLog("ReportEvent","fromString",`Failed to parse message. ${error.stack}`);
        throw new error(error);
        }
        return reportEvent;
    }
}
