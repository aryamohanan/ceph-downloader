import { RequestFilter } from '@models/Admin/RequestFilter';
import { RequestStatus } from '../Enums/Status';
import { IProvisioningRequestsFilter } from './IProvisioningRequestsFilter';
import { OperationsType } from '@models/Enums/OperationsType';

class ElasticQuery {
  bool: any;
  constructor(must: any[], must_not?: any[], filter?: any) {
    if (filter) {
      this.bool = { 'must': must, 'must_not': must_not, 'filter': filter };
    } else {
      this.bool = { 'must': must, 'must_not': must_not };
    }
    return this;
  }
}
export class ElasticSearchQuery {
  query: ElasticQuery;
  sort: Array<any>;
  track_total_hits: boolean;
  aggs: any;
  constructor() {
    this.query = { bool: {} };
  }

  RetrieveProvisioningRequestsQuery(filter: IProvisioningRequestsFilter) {
    const must = [];
    const must_not = [];
    this.track_total_hits = true;

    must.push({ match: { orgUrn: filter.orgUrn } });
    if (filter.sort) {
      let sortConditions = [];
      switch (filter.sort.sortBy) {
        case 'DateCreated':
          sortConditions.push({ dateCreated: { order: filter.sort.sortOrder } });
          break;
        case 'RequestId':
          sortConditions.push({ requestId: { order: filter.sort.sortOrder } });
          break;
        case 'RequestType':
          sortConditions.push({ requestType: { order: filter.sort.sortOrder } });
          break;
        case 'DateCompleted':
          sortConditions.push({ dateCompleted: { order: filter.sort.sortOrder } });
          break;
        case 'NumberOfSims':
          sortConditions.push({ numberOfSubscriptions: { order: filter.sort.sortOrder } });
          break;
        case 'Status':
          sortConditions.push({ requestStatus: { order: filter.sort.sortOrder } });
          break;
        case 'ProvisionedBy':
          sortConditions.push({ provisionedBy: { order: filter.sort.sortOrder } });
          break;
        case 'ServiceType':
          sortConditions.push({ serviceType: { order: filter.sort.sortOrder } });
          break;
        case 'RequestUrn':
        sortConditions.push({ requestUrn: { order: filter.sort.sortOrder } });
        break;
        case "ServiceTypeId":
          sortConditions.push({ serviceTypeId: { order: filter.sort.sortOrder } });
          break;
        default:
          break;
      }
      this.sort = sortConditions;
    }

    if (filter.requestStatus) {
      must.push({ match: { requestStatus: filter.requestStatus } });
    }

    if (filter.status)
      must.push({ match: { requestStatus: filter.status } });

    if (filter.requestIds?.length) {
      if (filter.requestIds.length === 1) {
        must.push({ match: { requestId: filter.requestIds[0] }});
      } else {
        const result = { terms: { requestId: [] }};
        filter.requestIds.forEach((requestId) => {
          result.terms.requestId.push(requestId);
        });
        must.push(result);
      }
    }

    if (filter.requestUrns?.length) {
      if (filter.requestUrns.length === 1) {
        must.push({ match: { requestUrn: filter.requestUrns[0] }});
      } else {
        const result = { terms: { requestUrn: [] }};
        filter.requestUrns.forEach((requestUrn) => {
          result.terms.requestUrn.push(requestUrn);
        });
        must.push(result);
      }
    }

    if (!(filter.requestIds?.length) && !(filter.requestUrns?.length)) {
      must_not.push({ match: { requestStatus: RequestStatus.SUBMITTED }});
    }
    must_not.push({ match: { operationsType: OperationsType.ESIM } });
    
    if (filter.serviceTypeId)
      must.push({ match: { serviceTypeId: filter.serviceTypeId } });

    if (filter.requestType) {
      must.push({ wildcard: { requestType: { value: `*${filter.requestType}` } } });
    }

    if (filter.searchText) {
      must.push({ query_string: { query: `*${filter.searchText.split(" ").join("?")}*`, fields: ["*"] }});
    }

    if (filter.provisionedBy) {
      must.push({ query_string: { query: `*${filter.provisionedBy.split(" ").join("?")}*`, fields: ["provisionedBy"] }});
    }

    if (filter.createdAfter || filter.createdBefore) {
      const filtering = { range: { dateCreated: { gte: filter.createdAfter, lte: filter.createdBefore } } };
      this.query.bool = new ElasticQuery(must, must_not, filtering).bool;
    } else {
      this.query.bool = new ElasticQuery(must, must_not).bool;
    } 
    return this;
  }

  getRequestDetailsQuery(requestFilter: RequestFilter) {
    const must = [];
    const mustNot = [];
    const filter = [];
    this.track_total_hits = true;
    this.sort = [ { dateCreated: { order: "desc" } }]
    if (requestFilter.requestIds?.length) {
      if (requestFilter.requestIds.length === 1) {
        must.push({ match: { requestId: requestFilter.requestIds[0] }});
      } else {
        const result = { terms: { requestId: [] }};
        requestFilter.requestIds.forEach((requestId) => {
          result.terms.requestId.push(requestId);
        });
        must.push(result);
      }
    }

    if (requestFilter.requestUrns?.length) {
      if (requestFilter.requestUrns.length === 1) {
        must.push({ match: { requestUrn: requestFilter.requestUrns[0] }});
      } else {
        const result = { terms: { requestUrn: [] }};
        requestFilter.requestUrns.forEach((requestUrn) => {
          result.terms.requestUrn.push(requestUrn);
        });
        must.push(result);
      }
    }
    if (requestFilter.status) {
      must.push({ match: { requestStatus: requestFilter.status } });
    }
    if (requestFilter.serviceTypeId) {
      must.push({ match: { serviceTypeId: requestFilter.serviceTypeId } });
    }
    if (requestFilter.searchText) {
      must.push({ query_string: { query: `*${requestFilter.searchText.split(" ").join("?")}*`, "fields": ["*"] }});
    }
    if (requestFilter.createdBy) {
      must.push({ query_string: { query: `*${requestFilter.createdBy.split(" ").join("?")}*`, fields: ["provisionedBy"] }});
    }
    if (requestFilter.requestCategory) {
      filter.push({ regexp: { requestType: `.*${requestFilter.requestCategory}.*` } });
    }
    if (requestFilter.filterOrgUrn) {
      filter.push({ regexp: { orgUrn: `.*${requestFilter.filterOrgUrn}.*` } });
    }
    mustNot.push({ match: { operationsType: OperationsType.ESIM } });
    mustNot.push({ match: { requestStatus: RequestStatus.SUBMITTED } });
    if (requestFilter.endDate || requestFilter.startDate) {
      filter.push({ range: { dateCreated: { gte: requestFilter.startDate, lte: requestFilter.endDate } } });
    }
    this.query.bool = new ElasticQuery(must, mustNot, filter).bool;
    return this;
  }
}



