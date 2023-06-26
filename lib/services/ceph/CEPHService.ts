const minio = require("minio");
import { Configurations } from "@config";
import { FILEXTENSION } from "@models/Enums/FileUpload";
import { Logger } from "@services/logger";
import { ServiceOutageCodes } from "@models/Enums/ServiceOutageCodes";
const XLSX = require("xlsx");
export class CEPHService {
  private static createCephConnection() {
    return new minio.Client({
      endPoint: Configurations.provisioningCeph.cephServer,
      accessKey: Configurations.provisioningCeph.cephAccessKey,
      secretKey: Configurations.provisioningCeph.cephSecretKey,
      port: Number(Configurations.provisioningCeph.cephPort),
      useSSL: Configurations.provisioningCeph.cephSSL ? JSON.parse(Configurations.provisioningCeph.cephSSL): false
    });
  }
  static async getDataFromCephFile(path: string, bucketName: string, fileName: string) {
    const resultArray = [];
    const chunks = [];
    await new Promise((resolve, reject) => {
      Logger.logInfo(
        "CEPHService",
        "getDataFromCephFile",
        `Started downloading from CEPH...`
      );
      const minioClient = CEPHService.createCephConnection();
      minioClient.getObject(bucketName, path, (error, dataStream)=> {
        if (error) {
          Logger.error(
            "getDataFromCephFile",
            `Error in calling getObject from CEPHService :${error.code}.Stack ${error.stack}.`
          );
          if(ServiceOutageCodes.includes(error.code)){
            reject(error);
          } else {
            resolve(false);
          }   
        } else {
          dataStream.on("data", (chunk)=> {
            chunks.push(chunk);
          });
          dataStream.on("end", () =>{
            const buffer = Buffer.concat(chunks);
            const fileType = fileName.split('.')[1];
            const workbook = XLSX.read(buffer, { type: "buffer" });
            const workSheetName = workbook.SheetNames[0];
            const workSheet = workbook.Sheets[workSheetName];
            const workSheetObjects = XLSX.utils.sheet_to_json(workSheet, {
              skipHeader: true,
              blankrows: false,
              raw: fileType === FILEXTENSION.XLSX,
              defval: "",
              header: 1,
            });
            if (workSheetObjects?.length) {
              workSheetObjects.forEach((element) => {
                resultArray.push(element);
              });
            }
              resolve(resultArray);
          });
          dataStream.on("error", (error)=> {
            Logger.error(
              "getDataFromCephFile",
              `Error in connecting to CEPH Error on calling dataStream from CEPHService downloadXLSXFromCeph.:${error}.Stack ${error.stack}.`
            );
            reject(error);
          });
        }
      });
    });
    return resultArray;
  }
  static async pushToCeph(path:string, fileStream:any):Promise<any> {
    try{    
      return new Promise((resolve, reject) => {
        const minioClient = CEPHService.createCephConnection();
        minioClient.putObject(Configurations.provisioningCeph.cephBucketName, path, fileStream, (error, etag) => {
          if (error){ 
            Logger.error('pushToCeph',`Error in connecting to CEPH on calling putobject :${error}.Stack ${error.stack}`);
            reject(error);
          }
          else{
            resolve(etag);
            Logger.logInfo('CEPHService','pushToCeph',`Successfully uploaded file to CEPH, Path:- ${path}`);
          }
        });
      });
    }
    catch(error){
      Logger.error('pushToCeph',`Error - ${error}`)
      throw new Error(error);
    }
  }
}