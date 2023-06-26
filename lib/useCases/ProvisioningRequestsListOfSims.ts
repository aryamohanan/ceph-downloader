import { Configurations } from "@config";
import { SupportedRequestCategoryForRequestDetails } from "@models/Constants/SupportedRequestCategoryForRequestDetails";
import { ReportNameTypes } from "@models/Enums/ReportTypes";
import { RequestUrnFormat } from "@models/Enums/RequestUrnFormat";
import { Requests } from "@models/Requests";
import { GetRequestDetails } from "./RequestDetails/GetRequestDetails";
import { ParsecClient } from "@services/clients/ParsecClient";
import { Logger } from '@services/logger';
import { GdsClient } from "@services/clients/GdsClient";
import { GraphQLClient } from "graphql-request";

export class ProvisioningRequestsListOfSims {
    categories: Array<string>;
    parsecClient: ParsecClient;
    gdsClient: GdsClient;
    constructor(){
        this.categories = [ReportNameTypes.PROVISIONING_REQUESTS_LISTOFSIMS];
        this.parsecClient = new ParsecClient(Configurations.getParsecUrl);
        const graphQLClient = new GraphQLClient(`${Configurations.getGDSUrl}/api/v1`);
        this.gdsClient = new GdsClient(graphQLClient); 
    }
    
    public isCategory(category: string) : boolean {
        return this.categories.indexOf(category) !== -1
    }
    public async getData(filter: any): Promise<any>{
        if(filter?.requestUrn){
            if(filter.requestUrn.startsWith(RequestUrnFormat.LEGACY))
            {
                filter.requestId =  Number(filter.requestUrn.replace(RequestUrnFormat.LEGACY, ""));
                filter.requestUrn = '';
            }
            let request: Requests;
            if (filter?.requestUrn) {
                request = await Requests.getByRequestUrn(filter.requestUrn); 
            }
            else if (filter?.requestId) {
                request = await Requests.getByLegacyRequestId(filter.requestId);
            }
            if (request && SupportedRequestCategoryForRequestDetails.includes(request.payload?.requestCategory)) {
                return await GetRequestDetails.call(request,filter);
            }
            else {
                filter.requestId = request?.legacyRequestId || filter?.requestId;
                return await this.requestDetailsFromParsecAPI(filter);
            }
        }
    }
    public async requestDetailsFromParsecAPI(filter: any) {
        try {
          const queryParam = `requestId=${filter.requestId}`;
          let parsecRequestDetailResponse = await this.parsecClient.getRequestDetails(
            queryParam
          );
          if (parsecRequestDetailResponse?.transactionList) {
            parsecRequestDetailResponse.transactionList.forEach(transaction => {
              transaction.RequestCompletionType = transaction?.isManual || '';
              transaction.ErrorMessage = '';
              transaction.ShortDescription = '';
            });
          }
          return {dataFromSource: parsecRequestDetailResponse?.transactionList};
        } catch (error) {
          Logger.error("ProvisioningRequestsListOfSims requestDetailsFromParsecAPI", error);
          throw error;
        }
      }
}