import { ReportEvent } from "@models/ReportEvent";
import { Logger } from '@services/logger';
import events = require('events');
import { KafkaMessage } from "@models/KafkaMessage";
import { IDownloadHandler } from "./IDownloadHandler";
import { ProvisioningRequestsListOfSims } from "./ProvisioningRequestsListOfSims";
import { ReportNameTypes, ReportTypes } from "@models/Enums/ReportTypes";
import { json2csv } from 'json-2-csv';
import * as json2xls from 'json2xls';
import * as archiver from 'archiver';
import { ProvisioningRequestSimResponse } from "@models/ProvisioningRequestSimResponse";
import { FILEXTENSION } from "@models/Enums/FileUpload";
import * as moment from 'moment';
import { Configurations } from "@config";
import { CEPHService } from "@services/ceph/CEPHService";
import { UploadFileResponse } from "@models/UploadFileResponse";
import { NotifierEventPayload } from "@models/NotifierEventPayload";
import { ProcessNotification } from "./Exceptions/processNotification";
import { EventType } from "@models/Enums/EventTypes";
import { NotifierDownloadEventPayload } from "@models/Enums/NotifierDownloadEventPayload";
import * as stream from "stream";
import { MessageProcessingEvents } from "@services/kafka/downloadRequestConsumer";
import { CephOutageCode, ServiceOutageCodes } from "@models/Enums/ServiceOutageCodes";
import { GrayLogSearchQueries } from "@models/Enums/GrayLogSearchQueries";
import { DownloadProvisioningRequests } from "./DownloadProvisioningRequests";
import { DownloadFolderNames } from "@models/Enums/Downloads";
import { ProvisioningRequestsResponse } from "@models/ProvisioningRequestsResponse";
import { DownloadProvisioningRequestsAdmin } from "./DownloadProvisioningRequestsAdmin"; 
import { RequestsAdminResponse } from "@models/RequestsAdminResponse";
import { DownloadRequestErrorDetails } from "./DownloadRequestErrorDetails";
import { RequestErrorResponse } from "@models/RequestErrorResponse";

type fileDetails = {
    uploadfileName: string,
    folderName: string
}
export class ProcessDownload extends events.EventEmitter {
    public downloadHandlers: Array<IDownloadHandler> = [
        new ProvisioningRequestsListOfSims(),
        new DownloadProvisioningRequests(),
        new DownloadProvisioningRequestsAdmin(),
        new DownloadRequestErrorDetails()
    ];
    async call(kafkaMessage: KafkaMessage) {
        try {
            const reportEvent = ReportEvent.fromString(kafkaMessage.value);
            const requestUrn = reportEvent.filter.requestUrn;
            Logger.logInfo("ProcessDownload","call", "Event received: " + JSON.stringify(reportEvent));
            const downloadHandler = this.downloadHandlers.find(handler => handler.isCategory(reportEvent.reportName));
            if(!downloadHandler){
                this.emit(MessageProcessingEvents.failed, kafkaMessage);
                return false;
            }
            const responseData = await downloadHandler.getData(reportEvent.filter);
            if(!responseData){
                this.emit(MessageProcessingEvents.failed, kafkaMessage);
                return;
            }
            let result: UploadFileResponse;
            const uniqueString = moment(new Date().toUTCString()).format('YYYYMMDDHHmmss');
            let uploadfileName: string;
            const downloadEvent = {
                eventType: 'FileDownload',
                eventName: 'File Download',
                filePath: '',
                messageBody: '',
                messageTitle: '',
                orgUrn: reportEvent.filter.orgUrn
            }
            switch (reportEvent.reportName) {
                case ReportNameTypes.PROVISIONING_REQUESTS_LISTOFSIMS: {
                    responseData.dataFromSource = responseData.dataFromSource.map(data=> new ProvisioningRequestSimResponse(data, reportEvent.reportType));
                    uploadfileName = `${requestUrn}-SubscriptionList-${uniqueString}.${FILEXTENSION[reportEvent.reportType]}`;
                    let fileStream;
                    if(reportEvent.reportType === ReportTypes.CSV){
                        const uploadData = await json2csv(responseData.dataFromSource);
                        fileStream = stream.Readable.from(uploadData);
                    }
                    else if(reportEvent.reportType === ReportTypes.XLSX){
                        const uploadData = json2xls(responseData.dataFromSource,this.generateExcelFields(Object.keys(responseData.dataFromSource[0])));
                        fileStream = Buffer.from(uploadData, 'binary');
                    }
                    result = await this.pushToCEPH(fileStream, {uploadfileName, folderName: DownloadFolderNames.LIST_OF_SIMS_AFFECTED});
                    downloadEvent.filePath = result.fileName;
                    downloadEvent.messageBody = `Filename: ${result.fileName.split('/').pop()} is ready for download.`;
                    downloadEvent.messageTitle = 'List of sims report is ready for Download';
                    break;
                }
                case ReportNameTypes.PROVISIONING_REQUESTS: {
                    responseData.dataFromSource = responseData.dataFromSource.map(data => new ProvisioningRequestsResponse(data, reportEvent.reportType));
                    uploadfileName = `ProvisioningRequests-${uniqueString}.${FILEXTENSION[reportEvent.reportType]}`;
                    let fileStream;
                    if(reportEvent.reportType === ReportTypes.CSV){
                        const csvData = await json2csv(responseData.dataFromSource);
                        fileStream = stream.Readable.from(csvData);
                    }
                    else if(reportEvent.reportType === ReportTypes.XLSX){
                        const uploadData = json2xls(responseData.dataFromSource, this.generateExcelFields(Object.keys(responseData.dataFromSource[0])));
                        fileStream = Buffer.from(uploadData, 'binary');
                    }
                        result = await this.pushToCEPH(fileStream, {uploadfileName, folderName: DownloadFolderNames.PROVISIONING_REQUESTS});
                        downloadEvent.filePath = result.fileName;
                        downloadEvent.messageBody = `Filename: ${result.fileName.split('/').pop()} is ready for download.`;
                        downloadEvent.messageTitle = 'Provisioning Requests report is ready for Download';
                    break;
                }
                case ReportNameTypes.REQUESTS_ADMIN: {
                    responseData.dataFromSource = responseData.dataFromSource.map(data => new RequestsAdminResponse(data, reportEvent.reportType));
                    uploadfileName = `RequestsAdmin-${uniqueString}.${FILEXTENSION[reportEvent.reportType]}`;
                    let fileStream;
                    if(reportEvent.reportType === ReportTypes.CSV){
                        const csvData = await json2csv(responseData.dataFromSource);
                        fileStream = stream.Readable.from(csvData);
                    }
                    else if(reportEvent.reportType === ReportTypes.XLSX){
                        const uploadData = json2xls(responseData.dataFromSource, this.generateExcelFields(Object.keys(responseData.dataFromSource[0])));
                        fileStream = Buffer.from(uploadData, 'binary');
                    }
                        result = await this.pushToCEPH(fileStream, {uploadfileName, folderName: DownloadFolderNames.REQUESTS_ADMIN});
                        downloadEvent.filePath = result.fileName;
                        downloadEvent.messageBody = `Filename: ${result.fileName.split('/').pop()} is ready for download.`;
                        downloadEvent.messageTitle = 'Requests Admin report is ready for Download';
                    break;
                }
                case ReportNameTypes.REQUEST_ERROR_DETAILS: {
                    responseData.dataFromSource = responseData.dataFromSource.map(data => new RequestErrorResponse(data, reportEvent.reportType));
                    uploadfileName = `${requestUrn || reportEvent.filter.requestId}-Error-${uniqueString}.${FILEXTENSION[reportEvent.reportType]}`;
                    let fileStream;
                    if(reportEvent.reportType === ReportTypes.CSV){
                        const csvData = await json2csv(responseData.dataFromSource);
                        fileStream = stream.Readable.from(csvData);
                    }
                    else if(reportEvent.reportType === ReportTypes.XLSX){
                        const uploadData = json2xls(responseData.dataFromSource, this.generateExcelFields(Object.keys(responseData.dataFromSource[0])));
                        fileStream = Buffer.from(uploadData, 'binary');
                    }
                        result = await this.pushToCEPH(fileStream, {uploadfileName, folderName: DownloadFolderNames.REQUESTS_ERRORS});
                        downloadEvent.filePath = result.fileName;
                        downloadEvent.messageBody = `Filename: ${result.fileName.split('/').pop()} is ready for download.`;
                        downloadEvent.messageTitle = 'Provisioning request error details report is ready for Download';
                    break;
                }
            }
            if(!result.success){
                Logger.errorLog("ProcessDownload", "call", result.errorMessage);
                this.emit(MessageProcessingEvents.failed, kafkaMessage);
                return;
            }
            await this.generateNotification(downloadEvent);
            this.emit(MessageProcessingEvents.finished, kafkaMessage);   
        }
        catch(error) {
            Logger.errorLog("ProcessDownload", "call", error);
            if(error.message.includes(CephOutageCode)){
                const eventDetails = {
                    eventName: "CEPH api call failed",
                    eventType: EventType.API_CALL_FAILED,
                    message: error.message,
                    grayLogSearchQuery: GrayLogSearchQueries.CEPH_OUTAGE_EXCEPTION,
                };
                await this.generateNotification(eventDetails);
                this.emit(MessageProcessingEvents.cephOutage, kafkaMessage);
              }
              else if(ServiceOutageCodes.includes(error.code)){
                this.emit(MessageProcessingEvents.provisioningDatabaseOutage, kafkaMessage);
              }
              else{
                this.emit(MessageProcessingEvents.failed, kafkaMessage);
              }
        }
    }

    async pushToCEPH(fileStream: any, fileDetails: fileDetails){
      const uploadResponse: UploadFileResponse = {
        errorMessage: '',
        success: false,
        successMessage: '',
        cephTag: '',
        fileName:''
      };
      
      const path = `${Configurations.provisioningCeph.cephPath}/${fileDetails.folderName}/${fileDetails.uploadfileName.split('.')[0]}.zip`;
      const archive = archiver("zip", {
        zlib: { level: 9 }
      })
      archive.append(fileStream, { name: fileDetails.uploadfileName });
      const uploadStream = new stream.PassThrough();
      archive.pipe(uploadStream);
      archive.finalize();
      const result = await CEPHService.pushToCeph(path, uploadStream);
      if (!result) {
        uploadResponse.success = false;
        uploadResponse.errorMessage = 'Error in connecting to CEPH.' || '';
      } else {
        uploadResponse.errorMessage = '';
        uploadResponse.success = true;
        uploadResponse.cephTag = String(result);
        uploadResponse.successMessage = 'Sucessfully updated to Ceph';
        uploadResponse.fileName = path;
      }
      return(uploadResponse)
    }

    async generateNotification(eventDetails: any) {
        const notifierEventPayload = new NotifierDownloadEventPayload(eventDetails)
        const notifierEvent = {
            eventName: eventDetails.eventName,
            eventType: eventDetails.eventType,
            happenedOn: new Date(),
            payload: notifierEventPayload
        };
        const processNotification = new ProcessNotification();
        await processNotification.call(notifierEvent);
    }

    generateExcelFields(headers: string[]){
        const fields = headers.reduce((accumulator, currentValue) => {
            return {
                ...accumulator,
                [currentValue]: 'string'
            }
        },{});
    }
}