import { Configurations } from "@config";
import { ElasticSearchQuery } from "@models/ElasticProvisioning/ElasticSearchQuery";
import { IProvisioningRequestsFilter } from "@models/ElasticProvisioning/IProvisioningRequestsFilter";
import { ReportNameTypes } from "@models/Enums/ReportTypes";
import { Logger } from '@services/logger';
import * as elasticsearch from  'elasticsearch'
import { ProvisioningRequestInfo } from "@models/ElasticProvisioning/ProvisioningRequestInfo";

export class DownloadProvisioningRequests {
    categories: Array<string>;
    elasticClient: any;
    constructor(){
        this.categories = [ReportNameTypes.PROVISIONING_REQUESTS];
        this.elasticClient = new elasticsearch.Client({
            host: Configurations.elasticClusterUrl,
            httpAuth: `${Configurations.provElasticUser}:${Configurations.provElasticPwd}`,
            ssl: { "pfx": [] }
        });
    }
    
    public isCategory(category: string) : boolean {
        return this.categories.indexOf(category) !== -1
    }
    public async getData(filter: IProvisioningRequestsFilter): Promise<any>{
        try {
            const body = new ElasticSearchQuery().RetrieveProvisioningRequestsQuery(filter);
            let allRecords = [];
            const params = {
                index: Configurations.elasticProvisioningRequestIndex,
                scroll: '2m',
                size: 10000,
                body
            };
            for await (const hit of this.scrollSearch(params)) {
                allRecords.push(new ProvisioningRequestInfo(hit._source));
            }
            return {dataFromSource: allRecords};
        } catch (error) {
            Logger.errorLog("DownloadProvisioningRequests","getData",error);
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
}