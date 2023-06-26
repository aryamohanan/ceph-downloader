import { request as gqlRequest, GraphQLClient } from 'graphql-request';
import { Logger } from '@services/logger';
import { Configurations } from '@config';

export class GdsClient {
  public graphQLClient: GraphQLClient;
  constructor(_graphQLClient: GraphQLClient) {
    this.graphQLClient = _graphQLClient;
  }

  public async getSubscriptionsByField(subscriptionUrns: Array<string>): Promise<any> {
    const query = `query {
      subscriptionsByField(
      fieldFilter: {
      subscriptionUrn: ${JSON.stringify(subscriptionUrns)}}){
        subscription {
          subscriptionUrn
          subscriptionId
          iccid_esn
          serviceTypeId
          orgId
          sims {
            productOffer,
            eid
          }
          imsiMsisdns{
            imsi,
            msisdn
          }
          lastActiveImsiMsisdn
          {
            msisdn
            imsi
          }
          states
          {
            state
          }
          costCenterUrn
          apnData{
            ipAddress
          }
        }
      }
    }`;
    return this.graphQLClient.request(query).then((data: any) => {
      return (data?.subscriptionsByField?.subscription) ? data.subscriptionsByField.subscription : [];
    }).catch(error => {
      Logger.error("GdsClient getSubscriptionsByField", error);
      return {};
    })
  }
  public subscriptionByIccid(iccid: string): Promise<any> {
    const query = `query { 
            subscriptionByIccid (iccid_esn: "${iccid}") {
            subscriptionId
            subscriptionUrn
            iccid_esn
            serviceTypeId
            orgUrn
        }}`;
    return this.graphQLClient.request(query).then((data:any) => {
      return data?.subscriptionByIccid;
    }).catch(error => {
      Logger.error("GdsClient subscriptionByIccid", error);
      return {};
    })
  }
}


