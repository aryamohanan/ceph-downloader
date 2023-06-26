import { Logger } from "@services/logger";
import { RequestStatus } from "@models/Enums/RequestStatus";

export class RequestFilter {
    requestIds: number[];
    requestUrns: string[];
    status: string;
    serviceTypeId: number;
    startDate: Date;
    endDate: Date;
    requestCategory: string;
    searchText: string;
    orgUrn: string;
    filterOrgUrn: string;
    createdBy: string;

    static fromJson(filter: any) {
        try {
            const requestFilter = new RequestFilter();
            requestFilter.requestIds = filter?.requestIds || [];
            requestFilter.requestUrns = filter?.requestUrns || [];
            requestFilter.status = filter?.status;
            requestFilter.serviceTypeId = filter?.serviceTypeId;
            requestFilter.startDate = filter?.startDate;
            requestFilter.endDate = filter?.endDate;
            requestFilter.requestCategory = filter?.requestCategory;
            requestFilter.searchText = filter?.searchText || '';
            requestFilter.orgUrn = filter?.orgUrn || '';
            requestFilter.createdBy = filter?.createdBy || '';
            requestFilter.filterOrgUrn = filter?.filterOrgUrn || '';
            return this.defaultFilter(requestFilter);
        }
        catch (error) {
            Logger.error("RequestFilter fromJson", error);
        }
    }

    static defaultFilter(requestFilter: RequestFilter) {
        if (!this.isFilterApplied(requestFilter)) {
            if (!(requestFilter.startDate || requestFilter.endDate)) {
                requestFilter.status = RequestStatus.Pending;
            }
            const date = new Date();       
            requestFilter.startDate = requestFilter.startDate || new Date(date.setDate(date.getDate() - 1));
            requestFilter.endDate = requestFilter.endDate || new Date();
        }
        if (requestFilter.startDate && !(requestFilter.endDate)) {
            requestFilter.endDate = new Date();
        }
        return requestFilter;
    }
    static isFilterApplied(requestFilter: RequestFilter) {
        return (requestFilter.requestIds?.length
          || requestFilter.requestUrns?.length
          || requestFilter.status
          || requestFilter.serviceTypeId
          || requestFilter.requestCategory
          || requestFilter.searchText
          || requestFilter.filterOrgUrn
          || requestFilter.createdBy
        );
    }
}
