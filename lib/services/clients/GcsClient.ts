import { request as gqlRequest, GraphQLClient } from 'graphql-request';
import { Logger } from '@services/logger';

export class GcsClient {
  public graphQLClient: GraphQLClient;
  constructor(_graphQLClient: GraphQLClient) {
    this.graphQLClient = _graphQLClient;
  }
  getCostCentersByUrns(urns: string[]): Promise<any> {
    const query = `query { 
      getCostCentersByUrns (orgUrns: ["${urns}"]) {
      name
      costCenterUrn}}`;
    return this.graphQLClient.request(query).then((data:any) => {
      return data?.getCostCentersByUrns;
    }).catch(error => {
        Logger.error("GcsClient getCostCentersByUrns", error);
        return null;
    })
  }

  getOrganizationDetailsByUrns(orgUrns: string[]): Promise<any> {
    const query = `query { 
      getOrganizationsDetailsByOrgUrns (orgUrns: ${JSON.stringify(orgUrns)}) {
        orgUrn
        name
        accountNumber
        orgID}}`;
    return this.graphQLClient.request(query).then((data:any) => {
      return data?.getOrganizationsDetailsByOrgUrns;
    }).catch(error => {
        Logger.error("GcsClient getOrganizationDetailsByUrns", error);
        return null;
    })
  }

  getAllOrganizationDetails(pageSize?: number,pageNumber?: number): Promise<any> {
    const resultPageSize = pageSize ? pageSize : 1000;
     const resultPageNumber = pageNumber ? pageNumber : 1;
    const query = `query { 
     getOrganizationsDetails(pageInfo:{pageSize:${resultPageSize},pageNumber:${resultPageNumber}})
     {
       Organizations
       {
        orgUrn
        accountNumber
        name
        enterpriseId
        orgID
       }
     }
  }`;
    return this.graphQLClient.request(query).then((data:any) => {
      return data?.getOrganizationsDetails?.Organizations;
    }).catch(error => {
        Logger.error("GcsClient getAllOrganizationDetails", error);
        return null;
    })
  }
}