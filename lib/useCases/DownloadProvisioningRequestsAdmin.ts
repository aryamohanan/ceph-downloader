import { ReportNameTypes } from "@models/Enums/ReportTypes";
import { Logger } from '@services/logger';
import { GetOrganizationDetails } from "./GetOrganizationDetails";
import { RequestFilter } from "@models/Admin/RequestFilter";
import * as elasticsearch from  'elasticsearch'
import { Configurations } from "@config";
import { ElasticSearchQuery } from "@models/ElasticProvisioning/ElasticSearchQuery";
import { RequestDetails } from "@models/Admin/RequestDetails";

export class DownloadProvisioningRequestsAdmin {
    categories: Array<string>;
    elasticClient: any;
    constructor(){
        this.categories = [ReportNameTypes.REQUESTS_ADMIN];
        this.elasticClient = new elasticsearch.Client({
            host: Configurations.elasticClusterUrl,
            httpAuth: `${Configurations.provElasticUser}:${Configurations.provElasticPwd}`,
            ssl: { "pfx": [] }
        });
    }
    
    public isCategory(category: string) : boolean {
        return this.categories.indexOf(category) !== -1
    }
    public async getData(payload: any): Promise<any>{
        try {
            const requestFilter = RequestFilter.fromJson(payload);
            const body = new ElasticSearchQuery().getRequestDetailsQuery(requestFilter);
            let requestDetails = [];
            const params = {
                index: Configurations.elasticProvisioningRequestIndex,
                scroll: '2m',
                size: 10000,
                body
            };
            for await (const hit of this.scrollSearch(params)) {
                requestDetails.push(hit._source);
            }
            if (requestDetails?.length) {
                const allOrganizationDetails = await this.getOrganizationDetailsByOrgUrns(requestDetails?.map(record => record.orgUrn));
                const response = await this.setResponse(requestDetails, allOrganizationDetails)
                return {dataFromSource: response};
            }
            else{
                return {dataFromSource: []};
            }
        } catch (error) {
            Logger.errorLog("DownloadProvisioningRequestsAdmin","getData",error);
            return null;
        }
    }

    async * scrollSearch (params) {
        let response = await this.elasticClient.search(params);
      
        while (true) {
          const sourceHits = response.hits.hits;
      
          if (sourceHits.length === 0) {
            break;
          }
      
          for (const hit of sourceHits) {
            yield hit;
          }
      
          if (!response._scroll_id) {
            break;
          }
      
          response = await this.elasticClient.scroll({
            scrollId: response._scroll_id,
            scroll: params.scroll
          })
        }
    }

    async getOrganizationDetailsByOrgUrns(orgUrns: string[]) {
        try {
          let missingOrgUrns: string[];
          const organizationDetails = new GetOrganizationDetails();
          const allOrganizationDetails = await organizationDetails.allOrganizationDetails();
          if (orgUrns.length > 0 && allOrganizationDetails.length > 0) {
            const orgUrnList = orgUrns.filter((orgUrn, org) => orgUrns.indexOf(orgUrn) === org);
            missingOrgUrns = orgUrnList.filter(org => allOrganizationDetails.findIndex(orgDetails => orgDetails.orgUrn === org) === -1);
            if (!missingOrgUrns?.length)
              return allOrganizationDetails;
            else {
              const orgDetails = await organizationDetails.detailsFromGcsByOrgUrns(missingOrgUrns);
              return allOrganizationDetails.concat(orgDetails);
            }
          } else return null;
        }
        catch (error) {
          Logger.error("DownloadProvisioningRequestsAdmin getOrganizationDetailsByOrgUrns", error);
          return null;
        }
    }

    async setResponse(requestDetails: any, allOrganizationDetails: any) {
        const response = [];
        try{
            for (const request of requestDetails) {
                const orgUrn = request.orgUrn;
                const orgDetails = await this.getOrganizationDetailsByOrgUrn(orgUrn, allOrganizationDetails);
                const result = RequestDetails.setResponse(request,orgDetails);
                response.push(result);
            }
            return response;
        }
        catch (error) {
            Logger.error("DownloadProvisioningRequestsAdmin setResponse", error);
            throw error;
        }
    }
    async getOrganizationDetailsByOrgUrn(orgUrn: string, orgDetails: any) {
        if (orgUrn) {
          const response = orgDetails?.filter((org) => org.orgUrn === orgUrn);
          if (response) {
            return await response[0]?.details;
          }    
        } 
        else{
            return null;
        }   
    }
}