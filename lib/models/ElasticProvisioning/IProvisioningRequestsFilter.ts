import {RequestStatus} from '../Enums/Status';

export interface IProvisioningRequestsFilter {
  orgUrn: string;
  createdBefore?: string;
  createdAfter?: string;
  requestStatus?: RequestStatus;
  status?: string;
  requestIds?: number[];
  requestUrns?: string[];
  requestType?: string;
  searchText?: string;
  provisionedBy?: string;
  serviceTypeId?: number;
  sort: {sortBy: string; sortOrder: string;};
  timezone?: string;
}