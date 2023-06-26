import { Configurations } from "@config";
import { Requests } from "@models/Requests";
import { GcsClient } from "@services/clients/GcsClient";
import { GdsClient } from "@services/clients/GdsClient";
import { Logger } from '@services/logger';
import { GraphQLClient } from "graphql-request";
import { RequestSubscription } from "@models/RequestSubscription";
import { SubscriptionTransactionDetails } from "@models/SubscriptionTransactionDetails";
import { ProvisioningRequestsListOfSims } from "@useCases/ProvisioningRequestsListOfSims";
export class GetRequestDetails {
    gdsClient: GdsClient;
    gcsClient: GcsClient;
  constructor(gdsClient: GdsClient, gcsClient: GcsClient) {
    this.gdsClient = gdsClient;
    this.gcsClient = gcsClient;      
  }
  static async call(request: Requests, filter?:any) {
    try {
      const gdsClient = new GdsClient(new GraphQLClient(`${Configurations.getGDSUrl}/api/v1`));
      const gcsClient = new GcsClient(new GraphQLClient(`${Configurations.getGCSUrl}/api/v1`));
      const requestDetails = new GetRequestDetails(gdsClient,gcsClient);
    return await requestDetails.setResponse(request,filter);
    } catch (error) {
      Logger.error(`GetRequestDetails.call Error occured for requestUrn: ${request.requestUrn}`, error);
      return null;
    }
  }
  async setResponse(request: Requests, filter:any) {
    try {
      return await this.getSubscriptionDetails(request);
    }
    catch (err) {
      Logger.error(`GetRequestDetails.setResponse Error occured for requestUrn: ${request.requestUrn}`, err);
      if(request.legacyRequestId || filter.requestId){
        filter.requestId = filter.requestId || request.legacyRequestId;
        return await this.fetchRequestDetailsFromParsecAPI(filter);
      }
      return null;
    }
  }

  async getSubscriptionDetails(request: Requests) {
    try {
      let subscriptionTransactionDetails = [];
      const requestSubscriptionDetails = await RequestSubscription.getByRequestUrn(request.requestUrn);
      const subscriptionUrns = requestSubscriptionDetails.map(subscription => subscription.subscriptionUrn)
      const subscriptionDetails = await this.gdsClient.getSubscriptionsByField(subscriptionUrns);
      const mappedSubscriptions = this.getSubscriptionByUrnMapping(subscriptionUrns, subscriptionDetails);
      const orgUrn = requestSubscriptionDetails[0].orgUrn;
      if (mappedSubscriptions?.length > 0) {
        const costCenterDetails = await this.gcsClient.getCostCentersByUrns(mappedSubscriptions.map(_subscription => _subscription?.costCenterUrn));
        for (let requestSubscription of requestSubscriptionDetails) {
          const subscription = mappedSubscriptions.find(r => r.subscriptionUrn === requestSubscription.subscriptionUrn);
          if (!subscription) {
            continue;
          }
          const subscriptions = SubscriptionTransactionDetails.fromDetails(subscription, requestSubscription, request);
          if (costCenterDetails?.length) {
            subscriptions.CostCenterName = costCenterDetails?.find((_costCenter) => _costCenter?.costCenterUrn === subscription?.costCenterUrn)?.name || '';
          }
          subscriptions.TotalRows = mappedSubscriptions.length;
          subscriptionTransactionDetails.push(subscriptions);
        }
      }
      return {dataFromSource: subscriptionTransactionDetails};
    }
    catch (err) {
      Logger.error(`GetRequestDetails.getSubscriptionDetails Error occured for requestUrn: ${request.requestUrn}`, err);
      throw err;
    }     
  }
  
  async fetchRequestDetailsFromParsecAPI(filter: any) {
    try {
      if(!filter?.requestId){
        return null;
      }
      const provisioningRequestsListOfSims = new ProvisioningRequestsListOfSims();
      return await provisioningRequestsListOfSims.requestDetailsFromParsecAPI(filter);
    }
    catch (error) {
      Logger.error(`GetRequestDetails.fetchRequestDetailsFromParsecAPI Error occured for input: ${JSON.stringify(filter)}`, error);
      return null;
    }
  }

  getSubscriptionByUrnMapping(subscriptionUrns: string[], subscriptionDetails: any[]) {
    return subscriptionUrns.map(subscriptionUrn => subscriptionDetails.find(subscription => subscription.subscriptionUrn === subscriptionUrn))
      .filter(Boolean)
  }
}