import events = require('events');
import { KafkaConsumer } from 'node-rdkafka';
import { FetchMessages } from './fetchMessage';
import { CommitMessage } from './commitMessage';
import { Configurations } from '@config';
import { KafkaMessage } from '@models/KafkaMessage';
import { Logger } from '@services/logger';
import { getConnection, createConnection } from 'typeorm';
import { ProcessDownload } from '@useCases/processDownload';
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
export class DownloadRequestConsumer extends events.EventEmitter {
    private kafkaConsumer: KafkaConsumer
    private fetchMessage: FetchMessages
    private commitMessage: CommitMessage
    private isBrokersAvailable: boolean = true
    private isKafkaConnected: boolean = false
    private processDownloadHandler: ProcessDownload
    constructor(kafkaConsumer?: KafkaConsumer) {
        super()
        this.kafkaConsumer = kafkaConsumer || new KafkaConsumer(
            {
                ...Configurations.KafkaSettings,
                offset_commit_cb: (err, topicPartitions) => {
                    if (err) {
                        Logger.error("DownloadRequestConsumer", err);
                    }
                    Logger.logDetails("DownloadRequestConsumer", JSON.stringify(topicPartitions));
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
        this.processDownloadHandler = new ProcessDownload();
        this.emit("brokersAvailablityCheck");
    }
    do() {
        return new Promise((resolve, reject) => {
            try {
                this.connectToKafka();
                this.kafkaConsumer.on('ready', () => {
                    Logger.logDetails("DownloadRequestConsumer.do", "DownloadRequestConsumer is ready..");
                    this.isBrokersAvailable = true;
                    this.isKafkaConnected = true;
                    this.kafkaConsumer.subscribe([Configurations.reportsTopic]);
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
        })
    }
    private connectToKafka() {
        this.kafkaConsumer.connect({}, (err, data) => {
            if (err) {
                Logger.errorDetails("DownloadRequestConsumer", "Error when initializing connector", JSON.stringify(err));
            }
        });
        this.kafkaConsumer.on('event.error', (log) => {
            Logger.error("DownloadRequestConsumer", `Error on Kafka Consumer. ${log}`);
            if (this.kafkaConsumer) {
                this.kafkaConsumer.disconnect((err, info) => {
                    Logger.error("DownloadRequestConsumer", 'Broker unavailability: Disconnected the consumer..');
                });
            }
            this.kafkaConsumer = null;
            this.isBrokersAvailable = false;
        });
    }
    private handleKafkaBrokerDown() {
        if (this.kafkaConsumer) {
            Logger.logDetails("DownloadRequestConsumer", "Active consumer available..");
            this.emit("brokersAvailablityCheck");
            if (!this.isKafkaConnected) {
                this.connectToKafka();
            }
        }
        else {
            Logger.logDetails("DownloadRequestConsumer", "No active consumer available. Creating new consumer..");
            const consumer = new DownloadRequestConsumer();
            consumer.do();
        }
    }
    private async startProcessingRequests() {
        this.fetchMessage.on(MesssageFetcherEvents.messageReceived, this.handleRequestReceived.bind(this));
        this.fetchMessage.on(MesssageFetcherEvents.noMessages, this.handleNoRequestsReceived.bind(this));
        this.processDownloadHandler.on(MessageProcessingEvents.finished, this.handleRequestProcessingFinished.bind(this));
        this.processDownloadHandler.on(MessageProcessingEvents.failed, this.handleRequestProcessingFailed.bind(this));
        this.processDownloadHandler.on(MessageProcessingEvents.provisioningDatabaseOutage, this.handleDBFailure.bind(this));
        this.processDownloadHandler.on(MessageProcessingEvents.cephOutage, this.handleCephOutage.bind(this));
        return this.fetch();
    }
    private fetch() {
        if (this.isBrokersAvailable)
            return this.fetchMessage.do();
    }
    private handleRequestReceived(message: KafkaMessage) {
        Logger.logDetails("DownloadRequestConsumer.handleRequestReceived", "Started processing request..");
        this.processDownloadHandler.call(message)
    }
    private handleNoRequestsReceived(args) {
        setTimeout(() => {
            Logger.logDetails("DownloadRequestConsumer.handleNoRequestsReceived", `Fetching from topics: ${Configurations.reportsTopic}`);
            this.fetch();
        }, Configurations.fetchWaitTime);
    }
    private async handleRequestProcessingFinished(message: KafkaMessage) {
        Logger.logDetails("DownloadRequestConsumer.handleRequestProcessingFinished", "Finished processing request");
        await this.commitMessage.do(message).catch(error => {
            Logger.error("DownloadRequestConsumer.handleRequestProcessingFinished", `Unable to commitMessage.${error}`);
        });
        Logger.logDetails("DownloadRequestConsumer.handleRequestProcessingFinished", "Fetching new requests..");
        this.fetch();
    }
    private async handleRequestProcessingFailed(message: KafkaMessage) {
        await this.commitMessage.do(message).catch(error => {
            Logger.error("DownloadRequestConsumer.handleRequestProcessingFailed", `Unable to commitMessage.${error}`);
        });
        Logger.logDetails("DownloadRequestConsumer.handleRequestProcessingFailed", "Fetching new requests..");
        this.fetch();
    }
    private async handleDBFailure(message: KafkaMessage) {
        await this.commitMessage.seek(message);
        const connection = await getConnection('default');
        connection.close();
        this.stopIntermittently();
    }
    private stopIntermittently() {
        Logger.logDetails('DownloadRequestConsumer', 'ERR-DB-UNAVAILABLE: Kafka fetch stopped temporarily due to db issue');
        setTimeout(async () => {
            const isDBAvailable = await this.isDBAvailable();
            if (isDBAvailable) {
                Logger.logDetails('DownloadRequestConsumer', 'fetching new requests after outage..');
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
        Logger.logDetails('DownloadRequestConsumer',`handling CEPH outage: ${message.value}`);
        await this.commitMessage.seek(message).catch(error => {
            Logger.error('DownloadRequestConsumer.handleCephOutage', error)
        });
        this.fetchAfterTimeout();
    }
    private fetchAfterTimeout() {
        setTimeout(() => {
            Logger.logDetails("DownloadRequestConsumer.fetchAfterTimeout", `Fetching from topics: ${Configurations.reportsTopic}`);
            this.fetch();
        }, Configurations.cephFetchWaitTimeInMilliSeconds);
    }
}
