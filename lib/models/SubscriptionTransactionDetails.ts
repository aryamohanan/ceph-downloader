import { ServiceTypeName } from "@models/Enums/Status";
import { TimeZone } from "@models/Enums/Status";
import { Logger } from '@services/logger';
import moment = require("moment-timezone");
import { Requests } from "./Requests";
import _  = require("lodash")

export class SubscriptionTransactionDetails {
  DateCreated: string;
  DateExecuted: string;
  SIMType: string ;
  SIMTypeID: number;
  SIMNumber: string;
  MSISDN: string ;
  SagStatusName: string;
  CostCenterName: string;
  TotalRows: number  = 0 ;
  IMSI: string;
  EID: string;
  DeviceStatus: string; 
  IPAddress: string;
  PreviousPlan: string;
  ErrorMessage: string;
  ShortDescription: string;
  RequestCompletionType: string;

  static fromDetails(subscriptionDetails: any, requestSubscription: any, requests: Requests) {
    try{
    const requestDetails = new SubscriptionTransactionDetails();
    requestDetails.SIMNumber = subscriptionDetails.iccid_esn;
    requestDetails.EID = subscriptionDetails.provisionedBy;
    requestDetails.SIMTypeID = subscriptionDetails.serviceTypeId;
    requestDetails.DateCreated = requests.dateCreated ? this.convertDateToESTZone(requests.dateCreated) : null;
    requestDetails.DateExecuted = requestSubscription?.dateCompleted ? this.convertDateToESTZone(requestSubscription.dateCompleted) : null;
    requestDetails.SIMType = ServiceTypeName[subscriptionDetails.serviceTypeId]; 
    requestDetails.DeviceStatus = subscriptionDetails?.states[0]?.state;
    requestDetails.CostCenterName = "";
    requestDetails.SagStatusName = _.capitalize(requestSubscription?.status) || "";
    requestDetails.ErrorMessage = "";
    requestDetails.ShortDescription = requestSubscription?.errorCode || "";
    requestDetails.RequestCompletionType = requestSubscription?.requestCompletionType || '';
    if(requestSubscription?.validationMessage){
      requestDetails.ErrorMessage = requestSubscription?.validationMessage;
    }else if(requests.errorLogs){
      requestDetails.ErrorMessage = requests.errorLogs
    }
    if (subscriptionDetails?.imsiMsisdns && subscriptionDetails?.imsiMsisdns[0])
    {
      requestDetails.IMSI = subscriptionDetails?.imsiMsisdns[0]?.imsi;
      requestDetails.MSISDN = subscriptionDetails?.imsiMsisdns[0]?.msisdn;
    }
    else if (subscriptionDetails?.lastActiveImsiMsisdn && subscriptionDetails?.lastActiveImsiMsisdn[0]){
      requestDetails.IMSI = subscriptionDetails?.lastActiveImsiMsisdn[0]?.imsi;
      requestDetails.MSISDN = subscriptionDetails?.lastActiveImsiMsisdn[0]?.msisdn;    
    }
    else{
      requestDetails.IMSI = '';
      requestDetails.MSISDN = '';
    }
    if (subscriptionDetails?.apnData && subscriptionDetails?.apnData[0])
    {
      requestDetails.IPAddress = subscriptionDetails?.apnData[0]?.ipAddress;
    }
    else{
      requestDetails.IPAddress = '';
    }
      return requestDetails;
    }
    catch (error)
    {
      Logger.error(`SubscriptionTransactionDetails.fromDetails details: ${JSON.stringify(subscriptionDetails)}`, error);
      return null;
    }
  }
  static convertDateToESTZone(date: Date) {
    return moment.utc(date).tz(TimeZone.EASTERN_STANDARD_TIME).format("YYYY-MM-DDTHH:mm:ss.SSS");
  }
}