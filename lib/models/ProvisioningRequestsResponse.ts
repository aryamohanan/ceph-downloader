import { ReportTypes } from "./Enums/ReportTypes";

export class ProvisioningRequestsResponse {
    requestType: string;
    requestId: string;
    createdOn: string;
    completedOn: string;
    serviceType: string;
    sims: string;
    provisionedBy: string;
    status: string;

    constructor(provisioningRequest: ProvisioningRequestsResponse, reportType: ReportTypes) {
        this.requestType = provisioningRequest.requestType;
        this.requestId = provisioningRequest.requestId?
                        (
                            reportType === ReportTypes.CSV ? 
                            `"${provisioningRequest.requestId}"` : provisioningRequest.requestId
                        )
                        : null;
        this.createdOn = provisioningRequest.createdOn;
        this.completedOn = provisioningRequest.completedOn;
        this.serviceType = provisioningRequest.serviceType;
        this.sims = provisioningRequest.sims? provisioningRequest.sims: null;
        this.provisionedBy = provisioningRequest.provisionedBy;
        this.status = provisioningRequest.status;
    }
}