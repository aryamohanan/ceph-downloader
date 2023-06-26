import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, In} from "typeorm";

@Entity('requests_fileUpload_details')
export class RequestsFileUploadDetails extends BaseEntity {    

    @PrimaryGeneratedColumn()
    id: number;
    @Column({ name: 'requestUrn' })
    requestUrn: string;
    @Column({ name: 'fileName' })
    fileName: string;
    @Column({ name: 'simNumber' })
    simNumber: string;
    @Column({ name: 'metadata', type: process.env.NODE_ENV == 'test' ? 'simple-json' : 'json' })
    metadata: any;
    @Column({ name: 'lastUpdated' })
    lastUpdated: Date;

    static async getRequestByRequestURNs(requestUrns: string[]) {
       return  RequestsFileUploadDetails.find({
          requestUrn: In(requestUrns)
        });
      }
      static async saveFileUploadRequests(request: any): Promise<RequestsFileUploadDetails> {
        const requestInstance = new RequestsFileUploadDetails();
        requestInstance.requestUrn = request.requestUrn;
        requestInstance.fileName = request.fileName;
        requestInstance.simNumber = request.simNumber;
        requestInstance.metadata = request.metadata;
        requestInstance.lastUpdated = new Date()
        const fileUploadRequest = await requestInstance.save();
        return fileUploadRequest;
      }
      static async deleteFileUploadRequests(requestUrns: string[]) {
       const deleteInstance = await RequestsFileUploadDetails.delete({ requestUrn: In(requestUrns)});
       return deleteInstance
      }
}