import { ReportTypes } from "./Enums/ReportTypes";

export class RequestErrorResponse{
    ICCID: string;
    ValidationMessage: string;

    constructor(request: any, reportType: ReportTypes) {
        this.ICCID = request.iccid?
                        (
                            reportType === ReportTypes.CSV ? 
                            `"${request.iccid}"` : (request.iccid).toString()
                        )
                        : null;
        this.ValidationMessage = request.validationMessage;
    }
}