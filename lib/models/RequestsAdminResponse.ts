import { RequestDetails } from "./Admin/RequestDetails";
import { ReportTypes } from "./Enums/ReportTypes";

export class RequestsAdminResponse{
    RequestID: string;
    RequestUrn: string;
    Status: string;
    ServiceType: string;
    RequestType: string;
    DateCreated: string;
    DateCompleted: string;
    CreatedBy: string;
    CompanyName: string;
    AccountNumber: string;

    constructor(request: RequestDetails, reportType: ReportTypes) {
        this.RequestID = request.RequestID?
                        (
                            reportType === ReportTypes.CSV ? 
                            `"${request.RequestID}"` : (request.RequestID).toString()
                        )
                        : null;
        this.RequestUrn = request.RequestUrn;
        this.Status = request.Status;
        this.ServiceType = request.ServiceType;
        this.RequestType = request.RequestType;
        this.DateCreated = request.DateCreated?(request.DateCreated).toString():'';
        this.DateCompleted = request.DateCompleted?(request.DateCompleted).toString():'';
        this.CreatedBy = request.CreatedBy;
        this.CompanyName = request.CompanyName;
        this.AccountNumber = request.AccountNumber?
                            (
                                reportType === ReportTypes.CSV ? 
                                `"${request.AccountNumber}"` : (request.AccountNumber).toString()
                            )
                            : null;
    }
}