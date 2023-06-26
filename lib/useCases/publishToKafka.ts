
import { GetKafkaProducer, ProduceKafkaMessage } from "@services/kafka/produceMessage";
import { KafkaMessageForFileUploads } from '@models/KafkaMessageForFileUploads';
import { DownloaderEvent } from "@models/DownloaderEvent";
import { Configurations } from '@config';
import { Logger } from '@services/logger';
export class PublishToKafka {
    produceKafkaMessage: ProduceKafkaMessage;
    constructor(produceKafkaMessage: ProduceKafkaMessage) {
        this.produceKafkaMessage = produceKafkaMessage;
    }
    static async call(event: DownloaderEvent) {
        const kafkaProducer = await GetKafkaProducer.call();
        const publishToKafkaHandler = new PublishToKafka(new ProduceKafkaMessage(kafkaProducer));
        return publishToKafkaHandler.call(event);
    }
    async call(event: DownloaderEvent) {
        const kafkaInternalProvisoningApiTopic = Configurations.getkafkaInternalProvisoningApiTopic;
        const KafkaMessageForFileUpload = {  "RequestURNs": event.requestURNs }
        const KafkaMessage: KafkaMessageForFileUploads = KafkaMessageForFileUploads.fromJson(KafkaMessageForFileUpload);
        this.produceKafkaMessage.call(
            KafkaMessage,
            kafkaInternalProvisoningApiTopic)
            .then(() =>
                Logger.logDetails("PublishToKafka call", `requestUrns published to kafka, ${event.requestURNs}`))
            .catch((error) => {
                Logger.error("PublishToKafka call", error);
                throw new error(error)
            });
    }
}