import { Configurations } from "@config";
import { ReportNameTypes } from "@models/Enums/ReportTypes";
import { Logger } from '@services/logger';
import { RequestDetailErrorFilter } from "@models/RequestDetailErrorFilter";
import { Requests } from "@models/Requests";
import { SupportedRequestCategoryForRequestDetails } from "@models/Constants/SupportedRequestCategoryForRequestDetails";
import { RequestSubscription } from "@models/RequestSubscription";
import { ParsecClient } from "@services/clients/ParsecClient";

export class DownloadRequestErrorDetails {
    categories: Array<string>;
    parsecClient: ParsecClient;
    constructor(){
        this.categories = [ReportNameTypes.REQUEST_ERROR_DETAILS];
        this.parsecClient = new ParsecClient(Configurations.getParsecUrl);
    }
    
    public isCategory(category: string) : boolean {
        return this.categories.indexOf(category) !== -1
    }
    public async getData(request: any): Promise<any>{
        try {
            const filter = RequestDetailErrorFilter.fromJson(request);
            const requestDetails = await this.getRequestDetailsForSupportedRequestCategories(filter)
            if (!requestDetails) {
                return null;
            }
            return await this.fetchValidationDetails(requestDetails,filter);
        } catch (error) {
            Logger.errorLog("DownloadRequestErrorDetails","getData",error);
            return null;
        }
    }

    async getRequestDetailsForSupportedRequestCategories(requestFilter:RequestDetailErrorFilter) {
        if (! Configurations.isRequestDetailsFromProvisioningEnabled) {
          return null;
        }
        let request: Requests;
        if (requestFilter?.requestUrn) {
          request = await Requests.getByRequestUrn(requestFilter.requestUrn); 
        }
        else if (requestFilter?.requestId) {
          request = await Requests.getByLegacyRequestId(requestFilter.requestId);
        }
        if (!request || !SupportedRequestCategoryForRequestDetails.includes(request.payload?.requestCategory)) {
          return null;
        }
        return request;
    }

    async fetchValidationDetails(request: Requests, filter?:RequestDetailErrorFilter) {
        try {
            const validationDetails = [];
            const subscriptionRequests = await RequestSubscription.getRequestDetailsByRequestUrn(request.requestUrn);
            if (subscriptionRequests?.data?.length) {
                    subscriptionRequests.data.forEach(item => {
                    const iccids = request?.payload?.requests?.find(request => request.subscriptionUrn === item.subscriptionUrn);
                    const subscriptionValidation = {
                        iccid: iccids?.iccid || '',
                        validationMessage: item?.validationMessage,
                        shortDiscription: item?.errorCode || ''
                    }
                    validationDetails.push(subscriptionValidation);
                });
            }
            return { dataFromSource: validationDetails }
        }
        catch (error) {
          Logger.error(`DownloadRequestErrorDetails fetchValidationDetails Error occured for requestUrn: ${request.requestUrn}`, error);
          throw error;
        }
    }
}