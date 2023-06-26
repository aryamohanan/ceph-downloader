export class KafkaMessageForFileUploads {
    RequestURNs: [];
    get keyBuffer(): Buffer {
        return null;
    }
    get valueBuffer(): Buffer {
        return Buffer.from(JSON.stringify(this));
    }
    static fromJson(jsonRequest: any): KafkaMessageForFileUploads {
        const kafkaMessage = new KafkaMessageForFileUploads();
        kafkaMessage.RequestURNs = jsonRequest.RequestURNs;
        return kafkaMessage;
    }
}