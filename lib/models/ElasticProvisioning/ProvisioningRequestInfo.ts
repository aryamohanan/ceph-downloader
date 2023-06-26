export interface IElasticProvisioningRequest {
    orgUrn: string;
    numberOfSims: number;
    requestId: number;
    dateCreated: string;
    dateCompleted: string;
    requestStatus: string;
    requestType: string;
    serviceType: string;
    provisionedBy: string;
    costCenter: string;
    numberOfSubscriptions: number;
    requestUrn: string;
    serviceTypeId: number;
    operationsType?: string;
}

export class ProvisioningRequestInfo {
  requestType: string;
  requestId: string;
  createdOn: string;
  completedOn: string;
  serviceType: string;
  sims: string;
  provisionedBy: string;
  costCenter: string;
  status: string;
  constructor(elasticProvisioningReq: IElasticProvisioningRequest) {
    if (elasticProvisioningReq) {
      this.requestType = elasticProvisioningReq.requestType || '';
      this.requestId = elasticProvisioningReq.requestId ? `${elasticProvisioningReq.requestId}`: '';
      this.createdOn = elasticProvisioningReq.dateCreated || '';
      this.completedOn = elasticProvisioningReq.dateCompleted || '';
      this.serviceType = elasticProvisioningReq.serviceType || '';
      this.sims = elasticProvisioningReq.numberOfSubscriptions ? `${elasticProvisioningReq.numberOfSubscriptions}`: '';
      this.provisionedBy = elasticProvisioningReq.provisionedBy || '';
      this.status = elasticProvisioningReq.requestStatus || '';
      return this;
    }
  }
}