export class RequestDetails {
    RequestID: number;
    RequestUrn: string;
    Status: string;
    ServiceType: string;
    RequestType: string;
    DateCreated: Date;
    DateCompleted: Date;
    OrgUrn: string;
    CreatedBy: string;
    CompanyName: string;
    AccountNumber: number;
    OrgID: number;

    static setResponse(request: any, orgDetails: { accountNumber: number; companyName: string; orgID: number; }) {
        const requestDetails = new RequestDetails();
        requestDetails.RequestID = request?.requestId || null;
        requestDetails.ServiceType = request?.serviceType || "";
        requestDetails.RequestType = request?.requestType || "";
        requestDetails.DateCreated = request?.dateCreated || null;
        requestDetails.Status = request?.requestStatus || "";
        requestDetails.DateCompleted = request?.dateCompleted || null;
        requestDetails.CreatedBy = request?.provisionedBy || "";
        requestDetails.AccountNumber = orgDetails?.accountNumber || null;
        requestDetails.CompanyName = orgDetails?.companyName || "";
        requestDetails.RequestUrn = request?.requestUrn || "";
        requestDetails.OrgUrn = request?.orgUrn || "";
        requestDetails.OrgID = orgDetails?.orgID || null;
        return requestDetails;
    }
}