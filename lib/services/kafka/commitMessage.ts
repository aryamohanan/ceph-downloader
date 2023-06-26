import { KafkaConsumer } from "node-rdkafka";
import { Configurations } from "@config";
import { KafkaMessage } from "@models/KafkaMessage";

export class CommitMessage {
    public kafkaConsumer: KafkaConsumer;
    constructor(kafkaConsumer: KafkaConsumer) {
        this.kafkaConsumer =
            kafkaConsumer ||
            new KafkaConsumer(Configurations.KafkaSettings, {});
    }
    public async do(message: KafkaMessage) {
        let data = message.raw;
        return this.kafkaConsumer.commitSync({
            topic: data.topic,
            partition: data.partition,
            offset: data.offset + 1,
        });
    }
    public async seek(message: KafkaMessage) {
        let data = message.raw;
        return this.kafkaConsumer.seek({
            topic: data.topic,
            partition: data.partition,
            offset: data.offset,
        }, 1, function (err) { });
    }
}
