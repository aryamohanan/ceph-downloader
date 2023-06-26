import events = require('events');
import { KafkaConsumer } from 'node-rdkafka';
import { FetchMessages } from './fetchMessage';
import { CommitMessage } from './commitMessage';
import { Configurations } from '@config';
import { KafkaMessage } from '@models/KafkaMessage';
import { Logger } from '@services/logger';
import { getConnection, createConnection } from 'typeorm';
import { EventHandler } from '@useCases/eventHandler';
export enum MesssageFetcherEvents {
    messageReceived = "messageReceived",
    noMessages = "noMessages"
}
export enum MessageProcessingEvents {
    finished = 'finished',
    failed = 'failed',
    provisioningDatabaseOutage = 'ProvisioningDatabaseOutage',
    cephOutage = 'CephOutage'
}
export enum KafkaBrokerMessage {
    error = 'all broker connections are down'
}
export class Consumer extends events.EventEmitter {
    private kafkaConsumer: KafkaConsumer
    private fetchMessage: FetchMessages
    private commitMessage: CommitMessage
    private isBrokersAvailable: boolean = true
    private isKafkaConnected: boolean = false
    private handleInComingEvents: EventHandler
    constructor(kafkaConsumer?: KafkaConsumer) {
        super()
        this.kafkaConsumer = kafkaConsumer || new KafkaConsumer(
            {
                ...Configurations.KafkaSettings,
                offset_commit_cb: (err, topicPartitions) => {
                    if (err) {
                        Logger.error("Consumer", err);
                    }
                    Logger.logDetails("Consumer", JSON.stringify(topicPartitions));
                },
            },
            {}
        );
        this.on("brokersAvailablityCheck", () => {
            setTimeout(() => {
                this.handleKafkaBrokerDown()
            }, 1000 * 60 * Configurations.brokersAvailabilityCheckInterval);
        })

        this.fetchMessage = new FetchMessages(this.kafkaConsumer);
        this.commitMessage = new CommitMessage(this.kafkaConsumer);
        this.handleInComingEvents = new EventHandler();
        this.emit("brokersAvailablityCheck");
    }
    do() {
        return (new Promise((resolve, reject) => {
            try {
                this.connectToKafka();
                this.kafkaConsumer.on('ready', () => {
                    Logger.logDetails("Consumer.do", "Consumer is ready..");
                    this.isBrokersAvailable = true;
                    this.isKafkaConnected = true;
                    this.kafkaConsumer.subscribe([Configurations.downloadRequestTopic]);
                    this.startProcessingRequests()
                        .then((result) => resolve(result))
                        .catch((error) => {
                            reject(error);
                            throw error;
                        });
                });
            } catch (error) {
                reject(error);
            }
        }))
    }
    private connectToKafka() {
        this.kafkaConsumer.connect({}, (err, data) => {
            if (err) {
                Logger.errorDetails("Consumer", "Error when initializing connector", JSON.stringify(err));
            }
        });
        this.kafkaConsumer.on('event.error', (log) => {
            Logger.error("Consumer", `Error on Kafka Consumer. ${log}`);
            if (this.kafkaConsumer) {
                this.kafkaConsumer.disconnect((err, info) => {
                    Logger.error("Consumer", 'Broker unavailability: Disconnected the consumer..');
                });
            }
            this.kafkaConsumer = null;
            this.isBrokersAvailable = false;
        });
    }
    private handleKafkaBrokerDown() {
        if (this.kafkaConsumer) {
            Logger.logDetails("Consumer", "Active consumer available..");
            this.emit("brokersAvailablityCheck");
            if (!this.isKafkaConnected) {
                this.connectToKafka();
            }
        }
        else {
            Logger.logDetails("Consumer", "No active consumer available. Creating new consumer..");
            const consumer = new Consumer();
            consumer.do();
        }
    }
    private async startProcessingRequests() {
        this.fetchMessage.on(MesssageFetcherEvents.messageReceived, this.handleRequestReceived.bind(this));
        this.fetchMessage.on(MesssageFetcherEvents.noMessages, this.handleNoRequestsReceived.bind(this));
        this.handleInComingEvents.on(MessageProcessingEvents.finished, this.handleRequestProcessingFinished.bind(this));
        this.handleInComingEvents.on(MessageProcessingEvents.failed, this.handleRequestProcessingFailed.bind(this));
        this.handleInComingEvents.on(MessageProcessingEvents.provisioningDatabaseOutage, this.handleDBFailure.bind(this));
        this.handleInComingEvents.on(MessageProcessingEvents.cephOutage, this.handleCephOutage.bind(this));
        return this.fetch();
    }
    private fetch() {
        if (this.isBrokersAvailable)
            return this.fetchMessage.do();
    }
    private handleRequestReceived(message: KafkaMessage) {
        Logger.logDetails("Consumer.handleRequestReceived", "Started processing request..");
        this.handleInComingEvents.call(message)
    }
    private handleNoRequestsReceived(args) {
        setTimeout(() => {
            Logger.logDetails("Consumer.handleNoRequestsReceived", `Fetching from topics: ${Configurations.downloadRequestTopic}`);
            this.fetch();
        }, Configurations.fetchWaitTime);
    }
    private async handleRequestProcessingFinished(message: KafkaMessage) {
        Logger.logDetails("Consumer.handleRequestProcessingFinished", "Finished processing request");
        await this.commitMessage.do(message).catch(error => {
            Logger.error("Consumer.handleRequestProcessingFinished", `Unable to commitMessage.${error}`);
        });
        Logger.logDetails("Consumer.handleRequestProcessingFinished", "Fetching new requests..");
        this.fetch();
    }
    private async handleRequestProcessingFailed(message: KafkaMessage) {
        await this.commitMessage.do(message).catch(error => {
            Logger.error("Consumer.handleRequestProcessingFailed", `Unable to commitMessage.${error}`);
        });
        Logger.logDetails("Consumer.handleRequestProcessingFailed", "Fetching new requests..");
        this.fetch();
    }
    private async handleDBFailure(message: KafkaMessage) {
        await this.commitMessage.seek(message);
        const connection = await getConnection('default');
        connection.close();
        this.stopIntermittently();
    }
    private stopIntermittently() {
        Logger.logDetails('Consumer', 'ERR-DB-UNAVAILABLE: Kafka fetch stopped temporarily due to db issue');
        setTimeout(async () => {
            const isDBAvailable = await this.isDBAvailable();
            if (isDBAvailable) {
                Logger.logDetails('Consumer', 'fetching new requests after outage..');
                this.fetch();
            } else {
                this.stopIntermittently();
            }
        }, Configurations.dbRetryInterval * 1000);
    }
    private async isDBAvailable() {
        try {
            await createConnection('default');
            return true;
        } catch (error) {
            return false;
        }
    }
    private async handleCephOutage(message: KafkaMessage){
        Logger.logDetails('Consumer',`handling CEPH outage: ${message.value}`);
        await this.commitMessage.seek(message).catch(error => {
            Logger.error('Consumer.handleCephOutage', error)
        });
        this.fetchAfterTimeout();
    }
    private fetchAfterTimeout() {
        setTimeout(() => {
            Logger.logDetails("Consumer.fetchAfterTimeout", `Fetching from topics: ${Configurations.downloadRequestTopic}`);
            this.fetch();
        }, Configurations.cephFetchWaitTimeInMilliSeconds);
    }
}
