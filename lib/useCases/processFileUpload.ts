import { FileUpload, FILEXTENSION } from '@models/Enums/FileUpload';
import { DownloaderEvent } from "@models/DownloaderEvent";
import { RequestsFileUploadDetails } from "@models/RequestsFileUploadDetails";
import { CEPHService } from '@services/ceph/CEPHService';
import { Requests } from '@models/Requests';
import { Configurations } from '@config';
import { Logger } from '@services/logger';
import { PublishToKafka } from './publishToKafka';
import events = require('events');
import { ServiceOutageCodes } from '@models/Enums/ServiceOutageCodes';
export class ProcessFileUpload extends events.EventEmitter {
    headers = [FileUpload.ICCID, FileUpload.IMEI]
    supportedEventType: string[] = [FileUpload.FILE_UPLOAD]
    isType(eventType: string): boolean {
        return this.supportedEventType.includes(eventType);
    }
    async call(event: DownloaderEvent) {
        return new Promise(async (resolve, reject) => {
            try {
                if (event?.requestURNs?.length) {
                    Logger.logInfo("ProcessFileUpload", "call", `RequestUrns: ${event.requestURNs}`)
                    const requestDetails = await Requests.getByRequestUrns(event.requestURNs);
                    if (requestDetails?.length) {
                        const uploadedfileName = requestDetails[0].fileName || '';
                        const totalNumberOfSubscriptions = requestDetails[0].payload?.totalNumberOfSubscriptions || this.getTotalNumberOfSubscription(requestDetails);
                        const fileUploadMappingDetails = await RequestsFileUploadDetails.getRequestByRequestURNs(event.requestURNs);
                        const fileUploadMappingCount = fileUploadMappingDetails.length;
                        const data = {
                            event, uploadedfileName, requestDetails
                        }
                        if (fileUploadMappingCount) {
                            if (fileUploadMappingCount !== totalNumberOfSubscriptions) {
                                await RequestsFileUploadDetails.deleteFileUploadRequests(event.requestURNs);
                                await this.fetchAndProcessCEPHData(data);
                            }else{
                                Logger.logInfo("ProcessFileUpload","call",`Skipping downloading from ceph, RequestUrns: ${event.requestURNs}`)
                                PublishToKafka.call(event);
                            }
                        } else {
                            await this.fetchAndProcessCEPHData(data);
                        }
                        resolve(true)
                    }
                    else{
                        Logger.logInfo("ProcessFileUpload", "call", `No valid requests found for RequestUrns: ${event.requestURNs}`)      
                    }
                }
            } catch (error) {
                Logger.errorDetails("ProcessFileUpload.call",error, `incoming event: ${JSON.stringify(event)}`);
                reject(error)
            }
        });

    }
    async getDataFromCEPH(fileName: string) {
        const path = `${Configurations.provisioningCeph.cephPath}/fileupload/${fileName}`;
        const bucketName = Configurations.provisioningCeph.cephBucketName;
        try{
            const cephData = await CEPHService.getDataFromCephFile(path, bucketName, fileName);
            return cephData
        }
        catch(error){
            Logger.error("ProcessFileUpload.getDataFromCEPH",error);
            if(ServiceOutageCodes.includes(error.code)){
                throw new Error(`CEPH-OUTAGE: ${error.message}`);
            } else{
                throw error;
            }
        }
    }
    getTotalNumberOfSubscription(requestDetails: any) {
        let totalCount = 0;
        requestDetails.forEach(request => {
            if (request.numberOfSubscriptions) {
                totalCount = totalCount + request.numberOfSubscriptions;
            }
        });
        return totalCount
    }
    async processCephData(data: any, requestDetails: any, fileName: string) {
        try {
            const fileHeaders = data.shift();
            const cephData = this.removeDuplicates(data)
            const iccidIndex = fileHeaders.findIndex(item => item.toLowerCase() === FileUpload.ICCID);
            const imeiIndex = fileHeaders.findIndex(item => item.toLowerCase() === FileUpload.IMEI);
            for(const request of requestDetails){
                if (request.numberOfSubscriptions) {
                    for (let i = 0; i < request.numberOfSubscriptions; i++) {
                        const fileData = cephData.shift();
                        if(fileData?.length){
                            const metadata = {};
                            if (iccidIndex > -1) {
                                metadata[FileUpload.ICCID] = fileData[iccidIndex]
                            }
                            if (imeiIndex > -1) {
                                metadata[FileUpload.IMEI] = fileData[imeiIndex]
                            }
                            const payload = {
                                'requestUrn': request.requestUrn,
                                'fileName': fileName,
                                'simNumber': fileData[iccidIndex],
                                'metadata': metadata,
                                'lastUpdated': new Date()
                            }
                            await RequestsFileUploadDetails.saveFileUploadRequests(payload);
                        }
                    }
                }
            }
            return (true)
        } catch (error) {
            Logger.errorLog("ProcessFileUpload", "processCephData", error);
            throw error;
        }
    }
    async processTextCephData(data: any, requestDetails: any, fileName: string) {
        try {
            const cephData = this.removeDuplicates(data)
            for(const request of requestDetails){
                if (request.numberOfSubscriptions) {
                    for (let i = 0; i < request.numberOfSubscriptions; i++) {
                        const fileData = cephData.shift();
                        if(fileData?.length && fileData[0]){
                            const metadata = {};
                            metadata[FileUpload.ICCID] = fileData[0].trim()
                                if(fileData?.length >= 2){
                                    metadata[FileUpload.IMEI] = fileData[1].trim()
                                }
                            const payload = {
                                'requestUrn': request.requestUrn,
                                'fileName': fileName,
                                'simNumber': fileData[0],
                                'metadata': metadata,
                                'lastUpdated': new Date()
                            }
                            await RequestsFileUploadDetails.saveFileUploadRequests(payload);
                        }
                    }
                }
            }
            return (true)
        } catch (error) {
            Logger.errorLog("ProcessFileUpload", "processTextCephData", error);
            throw error;
        }
    }
    removeDuplicates(data){
        data = data.filter(item=> item && item !=='')
        data = data.reduce((unique, item) => {
            if (!unique.some(obj => obj[0]===item[0])) {
                unique.push(item);
            }
            return unique;
        }, []);
        return data
    }

    async fetchAndProcessCEPHData(data: any) {
        try{
            const cephData = await this.getDataFromCEPH(data?.uploadedfileName)
            if (cephData?.length) {
                const fileType = data?.uploadedfileName.split('.')[1];
                if(fileType === FILEXTENSION.TXT){
                    await this.processTextCephData(cephData, data?.requestDetails, data?.uploadedfileName);
                }else{
                    await this.processCephData(cephData, data?.requestDetails, data?.uploadedfileName);
                }
                PublishToKafka.call(data?.event)
            }
            else {
                Logger.logInfo("ProcessFileUpload", "fetchAndProcessCEPHData", `No cephData available for filename: ${data?.uploadedfileName}  and  requestDetails: ${JSON.stringify(data?.requestDetails)}`)
                
            }
        }
        catch(error){
            Logger.errorLog("ProcessFileUpload","fetchAndProcessCEPHData",error);
            throw error;
        } 
    }
}