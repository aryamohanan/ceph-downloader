import { KafkaConsumer } from "node-rdkafka";
import { Configurations } from "@config";
import { HealthCheckItem } from "@models/Health/HealthCheckItem";
import { Status } from "@models/Enums/Status";

export class KafkaStatus {
    public kafkaConsumer: KafkaConsumer;
    constructor(kafkaConsumer?: KafkaConsumer) {
        this.kafkaConsumer = kafkaConsumer || new KafkaConsumer(Configurations.KafkaConsumerSettings, {})
    }

    connect = () => {
        const promiseResult = new Promise<HealthCheckItem>((resolve, reject) => {
            try {
                const settings = JSON.parse(JSON.stringify(Configurations.KafkaConsumerSettings));
                const healthData = `{"name": "Kafka connection check",
            "properties": {"BrokerList":"${settings['metadata.broker.list']}"},
            "descriptionHref":"${settings['group.id']}"}`;
                let healthItem = new HealthCheckItem(healthData);
                this.kafkaConsumer.connect()
                    .on('ready', () => {
                        healthItem.setHealthStatus(Status.green, 'Successfully connected to Kafka service');
                        resolve(healthItem);
                    }).on('connection.failure', (err) => {
                        healthItem.setHealthStatus(Status.red, err);
                        resolve(healthItem);
                    });
            }
            catch (Err) {
                console.log('error:', Err);
                reject(Err);
            }
            finally {
                this.kafkaConsumer.disconnect();
            }
        })
        return promiseResult;
    }
}
