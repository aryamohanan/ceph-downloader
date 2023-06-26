
export class FakeRequests {

    static generateFakeRequestDetails (): any{
        return [
            {
          requireCarrierCall: true,
          id: 27580,
          legacyRequestId: 12345,
          status: 'pending',
          payload: {
            contactCarrier: true,
            requestCategory: 'Activation',
            orgUrn: 'cmp-pp-org-14',
            fileName: 'BulkUploadTest-20230203043210.xlsx',
            userId: 'fake@korewireless.com',
            toEmail: 'fake@korewireless.com',
            requests: [],
            excludeCarrierSteps: false,
            isOnHold: false,
            action: 'Activate',
            activationProfileUrn: '',
            totalNumberOfSubscriptions: 2,
            serviceTypeId: 31,
            activationState: 'Active',
            fallbackActivationProfileURN: '',
            ipndInfo: '',
            sku: '',
            numberOfSubscriptions: 2
          },
          errorLogs: null,
          requestUrn: 'cmp-cpro-request-27580',
          profileUrn: null,
          completionStatus: null,
          dateCreated: new Date(),
          dateCompleted: null,
          requestType: null,
          onhold: false,
          excludeCarrierSteps: false,
          fileName: 'BulkUploadTest-20230203043210.xlsx',
          numberOfSubscriptions: 2,
          requestNotes: '',
          orgUrn: '',
          requestCategory: '',
          serviceTypeId: null
        }
      ]
    }

   static generateFakeDownloaderEvent (){
    return {
        eventType: 'fileUpload',
        requestURNs: [ 'cmp-cpro-request-27580' ]
      };
   }
   static generateFakeCephData (){
    return [
        [ 'ICCID', 'IMEI' ],
        [ '8910390000023164924', '' ],
        [ '8910390000023165046', '' ]
      ];
   }
   static generateFakeFileUploadRequest ():any{
    return {
        requestUrn: 'cmp-cpro-request-27583',
        fileName: 'BulkUploadTest-20230203050935.xlsx',
        simNumber: '8910393788294650433',
        metadata: { iccid: '8910393788294650433', imei: '' },
        lastUpdated: new Date(),
        id: 6170
      }
   }
   static gdsGetSubscriptionsByField ():any{
    {
      return [
            {
              "subscriptionUrn": "cmp-pp-subscription-187190",
              "subscriptionId": 246593,
              "iccid_esn": "8910393788294650143",
              "serviceTypeId": 31,
              "orgId": 22,
              "sims": [
                {
                  "productOffer": "KORE eSIM Red",
                  "eid": "89103989103937882946501430000143"
                }
              ],
              "imsiMsisdns": [
                {
                  "imsi": "204048294650143",
                  "msisdn": "3788294650143"
                }
              ],
              "lastActiveImsiMsisdn": [
                {
                  "msisdn": "3788294650143",
                  "imsi": "204048294650143"
                }
              ],
              "states": [
                {
                  "state": "Active"
                }
              ],
              "costCenterUrn": null,
              "apnData": null
            }
          ]
    }
   }
   static generateFakeRequestSubscription(): any{
    return [
        {
          "id":40956,
          "subscriptionUrn":"cmp-pp-subscription-187190",
          "requestUrn":"cmp-cpro-request-27580",
          "orgUrn":"cmp-pp-org-14",
          "status":"completed",
          "isValidationSucceeded":true,
          "isValidated":true,
          "requestCompletionType":"System",
          "lastUpdatedOn":"2023-04-17T12:54:09.847Z",
          "dateCompleted":"2023-04-17T12:54:09.847Z",
          "validationMessage":null,
          "errorCode":null
        }
      ]
   }
   static generateFakeRequestDetailsLegacy ():any{
    return [
    {
      requireCarrierCall: true,
      id: 27580,
      legacyRequestId: null,
      status: 'pending',
      payload: {
        contactCarrier: true,
        requestCategory: 'Activate',
        orgUrn: 'cmp-pp-org-14',
        fileName: 'BulkUploadTest-20230203043210.xlsx',
        userId: 'fake@korewireless.com',
        toEmail: 'fake@korewireless.com',
        requests: [],
        excludeCarrierSteps: false,
        isOnHold: false,
        action: 'Activate',
        activationProfileUrn: '',
        totalNumberOfSubscriptions: 2,
        serviceTypeId: 31,
        activationState: 'Active',
        fallbackActivationProfileURN: '',
        ipndInfo: '',
        sku: '',
        numberOfSubscriptions: 2
      },
      errorLogs: null,
      requestUrn: 'cmp-pp-request-49482',
      profileUrn: null,
      completionStatus: null,
      dateCreated: new Date(),
      dateCompleted: null,
      requestType: null,
      onhold: false,
      excludeCarrierSteps: false,
      fileName: 'BulkUploadTest-20230203043210.xlsx',
      numberOfSubscriptions: 1
    }
  ]
  }
  static generateFakeRequestDetailsFromParsecAPI(): any{
    return [
      {
        "SIMID":915924,
        "RequestID":49482,
        "RequestStatus":"Completed",
        "RequestStatusID":2,
        "DateCreated":"2023-03-21T05:37:55.217Z",
        "ReturnMessage":"",
        "ReturnCode":"0",
        "DateToProcess":null,
        "DateExecuted":"2023-03-21T05:37:55.280Z",
        "QueryCount":1,
        "SIMType":"KORE eConnect",
        "SIMTypeID":40,
        "SIMNumber":"8910390000035909322",
        "SIMStatus":"Active",
        "SIMInternalStatus":"Suspended With Charge",
        "MSISDN":"3197023337145",
        "CarrierRatePlan":null,
        "CarrierRateFeatureCode":"",
        "CarrierProfile":null,
        "SagStatusName":"Done",
        "SAGStatus":777,
        "CostCenterSymbol":null,
        "CostCenterName":null,
        "PreviousPlan":"",
        "PreviousMSISDN":"3197023337145",
        "NextMSISDN":"",
        "IPAddress":"10.27.48.51",
        "TotalRows":1,
        "RequestedImeiNumber":null,
        "IMSI":"222013888020673",
        "EID":"89001039240060124300000000838934",
        "DeviceStatus":"Suspended With Charge",
        "RequestOwner":"Parsec",
        "RequestCompletionType":"",
        "ErrorMessage":"",
        "ShortDescription":""
      }
    ] 
  }
  static generateFakeListOfSimsResponse(): any{
    return [
      { 
      TotalRows: 1, 
      SIMNumber: '8910393788294650143', 
      EID: undefined, 
      SIMTypeID: 31, 
      DateCreated: '2023-04-17T08:51:53.882', 
      DateExecuted: '2023-04-17T08:54:09.847', 
      SIMType: 'KORE ESIM RED', 
      DeviceStatus: 'Active', 
      CostCenterName: '', 
      SagStatusName: 'Completed', 
      ErrorMessage: '', 
      ShortDescription: '', 
      RequestCompletionType: 'System', 
      IMSI: '204048294650143', 
      MSISDN: '3788294650143', 
      IPAddress: '' 
      }
    ]
  }
  static generateFakeParsecClientResponse(): any{
    return {
      "requestCategoryDetails": {},
      "requestDetails": {},
      "transactionList": [
        {
          "SIMID": 1763332,
          "RequestID": 49503,
          "RequestStatus": "Completed",
          "RequestStatusID": 2,
          "DateCreated": "2023-03-22T05:36:28.553Z",
          "ReturnMessage": "",
          "ReturnCode": "0",
          "DateToProcess": null,
          "DateExecuted": "2023-03-22T05:36:28.570Z",
          "QueryCount": 1,
          "SIMType": "KORE Telenor",
          "SIMTypeID": 41,
          "SIMNumber": "89460185002659708773",
          "SIMStatus": "Deactivated",
          "SIMInternalStatus": "Pending Scrap",
          "MSISDN": "614367788608773",
          "CarrierRatePlan": null,
          "CarrierRateFeatureCode": "",
          "CarrierProfile": null,
          "SagStatusName": "Done",
          "SAGStatus": 777,
          "CostCenterSymbol": null,
          "CostCenterName": null,
          "PreviousPlan": "",
          "PreviousMSISDN": "614367788608773",
          "NextMSISDN": "",
          "IPAddress": null,
          "TotalRows": 1,
          "RequestedImeiNumber": null,
          "IMSI": "505016100108773",
          "EID": null,
          "DeviceStatus": "Active",
          "RequestOwner": "Parsec"
        }
      ]
    }
  }
  static generateFakeGdsSubscriptionByIccidResponse(): any{
    return {
      "subscriptionId": 1000154027,
      "subscriptionUrn": "cmp-k1-subscription-1000154027",
      "iccid_esn": "89014485213454521871",
      "serviceTypeId": 6,
      "orgUrn": "cmp-pp-org-14"
    }
  }
}