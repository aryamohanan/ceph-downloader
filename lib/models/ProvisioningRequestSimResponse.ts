import { ReportTypes } from "./Enums/ReportTypes";

export interface IParsecTransactionItem {
    SIMID: number;
    RequestID: number;
    RequestStatus: string;
    RequestStatusID: number;
    DateCreated: string;
    ReturnMessage: string;
    ReturnCode: string;
    DateToProcess: string;
    DateExecuted: string;
    QueryCount: number;
    SIMType: string;
    SIMTypeID: number;
    SIMNumber: string;
    SIMStatus: string;
    SIMInternalStatus: string;
    MSISDN: string;
    CarrierRatePlan: string;
    CarrierRateFeatureCode: string;
    CarrierProfile: string;
    SagStatusName: string;
    SAGStatus: number;
    CostCenterSymbol: string;
    CostCenterName: string;
    PreviousPlan: string;
    PreviousMSISDN: string;
    NextMSISDN: string;
    IPAddress: string;
    TotalRows: number;
    RequestedImeiNumber: string;
    IMSI: string;
    EID: string;
    DeviceStatus: string;
    ErrorMessage: string;
    ShortDescription: string;
    RequestCompletionType?: string;
}

export class ProvisioningRequestSimResponse {
    SIMSTATUS: string;
    MSISDN: string;
    DATECOMPLETED: string;
    TRANSACTIONSTATUS: string;
    ICCID: string;
    IPADDRESS: string;
    IMEI: string;
    COSTCENTER: string;
    EID: string;
    IMSI: string;
    ERRORMESSAGE: string;
    SHORTDESCRIPTION: string;
    REQUESTCOMPLETIONTYPE: string;
  
    constructor(parsecTransactionItem: IParsecTransactionItem, reportType: ReportTypes) {
      this.SIMSTATUS = parsecTransactionItem.DeviceStatus;
      this.ICCID = parsecTransactionItem.SIMNumber ? 
                    (
                      reportType === ReportTypes.CSV ? 
                      `"${parsecTransactionItem.SIMNumber}"` : parsecTransactionItem.SIMNumber
                    )
                    : null;
      this.MSISDN = parsecTransactionItem.MSISDN ?
                      (
                        reportType === ReportTypes.CSV ? 
                        `"${parsecTransactionItem.MSISDN}"` : parsecTransactionItem.MSISDN
                      )
                      : null;
      this.DATECOMPLETED = parsecTransactionItem.DateExecuted;
      this.TRANSACTIONSTATUS = parsecTransactionItem.SagStatusName;
      this.IMEI = parsecTransactionItem.RequestedImeiNumber ?
                    (
                      reportType === ReportTypes.CSV ? 
                      `"${parsecTransactionItem.RequestedImeiNumber}"` : parsecTransactionItem.RequestedImeiNumber
                    )
                    : null;
      this.IPADDRESS = parsecTransactionItem.IPAddress;
      this.EID = parsecTransactionItem.EID ?
                  (
                    reportType === ReportTypes.CSV ? 
                    `"${parsecTransactionItem.EID}"` : parsecTransactionItem.EID
                  )
                  : null;
      this.IMSI = parsecTransactionItem.IMSI ?
                    (
                      reportType === ReportTypes.CSV ? 
                      `"${parsecTransactionItem.IMSI}"` : parsecTransactionItem.IMSI
                    )
                    : null;
      this.COSTCENTER = parsecTransactionItem.CostCenterName;
      this.ERRORMESSAGE = parsecTransactionItem.ErrorMessage;
      this.SHORTDESCRIPTION = parsecTransactionItem.ShortDescription;
      this.REQUESTCOMPLETIONTYPE = parsecTransactionItem.RequestCompletionType;
      return this;
    }
  }