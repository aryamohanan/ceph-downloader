import { KafkaMessage } from "@models/KafkaMessage";
import events = require("events");
import { KafkaConsumer } from "node-rdkafka";
export enum KafkaEvents {
    messageReceived = "messageReceived",
    noMessages = "noMessages",
    error = "error",
}
export class FetchMessages extends events.EventEmitter {
    private Consumer: KafkaConsumer;
    constructor(consumer: KafkaConsumer) {
        super();
        this.Consumer = consumer;
        this.Consumer
            .on('data', (data) => {
                const message = KafkaMessage.fromRawMessage(data);
                this.emit(KafkaEvents.messageReceived, message);
            });
    }
    do() {
        return (new Promise((resolve, reject) => {
            this.Consumer.consume(1, (err, message) => {
                if (!message || message.length === 0) {
                    this.emit(KafkaEvents.noMessages);
                }
                else {
                    resolve(message[0]);
                }
            });
        }))
    }
}
