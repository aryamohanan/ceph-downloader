import { ClusterNode, ClusterOptions } from "ioredis";

export class Configurations {
    public static get port() {
        return process.env.port || 9000;
    }
    public static get KafkaProvisioningConsumerSettings(): {} {
        const kafkaConfigurationSetting = {
            'group.id': process.env.kafkaGroupId,
            'metadata.broker.list': `${process.env.kafkaBrokerList}:${process.env.kafkaBrokerPort}`,
            'enable.auto.commit': false
        }
        return kafkaConfigurationSetting
    }
    public static get KafkaConsumerSettings(): {} {
        if (this.connectInternalToK8Kafka) {
            return this.KafkaK8ConsumerSettings;
        }
        return this.KafkaProvisioningConsumerSettings;
    }
    public static get KafkaK8ConsumerSettings(): {} {
        const kafkaConfigurationSetting = {
            "group.id": process.env.kafkaGroupId,
            "enable.auto.commit": false,
            ...this.KafkaK8Settings
        }
        return kafkaConfigurationSetting
    }
    public static get KafkaK8Settings(): {} {
        const kafkaConfigurationSetting = {
            "metadata.broker.list": process.env.kafkaK8Broker,
            "security.protocol": "ssl",
            "ssl.certificate.location": "/etc/kafka-secrets/kafka/kafkak8.crt",
            "ssl.key.location": "/etc/kafka-secrets/kafka/kafkak8.key",
            "ssl.ca.location": "/etc/kafka-secrets/kafka/ca.pem"
        }
        return kafkaConfigurationSetting
    }

    public static get KafkaProducerSettings(): {} {
        if (this.connectInternalToK8Kafka) {
            return this.KafkaK8Settings;
        }
        return this.KafkaProvisioningProducerSettings;
    }

    public static get KafkaProvisioningProducerSettings(): {} {
        const kafkaConfigurationSetting = {
            'metadata.broker.list': `${process.env.kafkaBrokerList}:${process.env.kafkaBrokerPort}`
        }
        return kafkaConfigurationSetting
    }
    
    public static get connectInternalToK8Kafka() {
        return process.env.connectInternalToK8Kafka === "true" ? true : false;
    }
    public static get KafkaSettings(): {} {
        if (this.connectInternalToK8Kafka) {
            return this.KafkaK8ConsumerSettings;
        }
        return this.KafkaProvisioningConsumerSettings;
    }
    public static get brokersAvailabilityCheckInterval() {
        return parseInt(process.env.brokersAvailabilityCheckInterval);
    }
    public static get fetchWaitTime() {
        return 1000;
    }
    public static get cephFetchWaitTimeInMilliSeconds(){
        return 60000;
    }
    public static get dbRetryInterval() {
        return parseInt(process.env.dbRetryInterval);
    }
    public static get downloadRequestTopic() {
        return process.env.downloadRequestTopic;
    }
    public static get reportsTopic(){
        return process.env.reportsTopic;
    }
    public static get provisioningCeph(){
        return {
            cephAccessKey: process.env.ProvisioningCEPHAccessKey,
            cephSecretKey: process.env.ProvisioningCEPHSecretKey,
            cephBucketName: process.env.ProvisioningCEPHBucketName,
            cephPath: process.env.ProvisioningCEPHPath,
            cephPort: process.env.ProvisioningCEPHPort,
            cephServer: process.env.ProvisioningCEPHServer,
            cephSSL: process.env.ProvisioningCEPHSSL
            
          }
    }
    public static get getkafkaInternalProvisoningApiTopic(){
        return  process.env.kafkaInternalProvisoningApiTopic;
    }
    public static get notificationKafkaTopic() {
        if (this.connectInternalToK8Kafka) {
          return `${process.env.kafkaK8prefix}${process.env.notificationKafkaTopic}`;
        }
        return process.env.notificationKafkaTopic;
    }
    public static get getGDSUrl() {
        return process.env.GDSUrl;
    }
    public static get getGCSUrl() {
        return process.env.GCSUrl;
    }
    public static get getParsecUrl() {
        return process.env.ParsecUrl;
    }
    public static get elasticClusterUrl(){
        return process.env.elasticClusterUrl;
    }
    public static get provElasticUser(){
        return process.env.ProvisioningK8ElasticUser;
    }
    public static get provElasticPwd(){
        return process.env.ProvisioningK8ElasticPassword;
    }
    public static get elasticProvisioningRequestIndex(){
        return process.env.elasticProvisioningRequestIndex;
    }
    public static get redisSettings(): ClusterOptions {
        return {
          scaleReads: "all",
          redisOptions: {
            username: process.env.redisUserName,
            password: process.env.redisPassword,
            enableAutoPipelining: true,
          },
          enableReadyCheck: true,
          clusterRetryStrategy: function (times, error) {
            if (times < 2) {
              return Math.min(100 + times * 2, 2000);
            }
            return null;
          }
        };
      }
    public static get redisClusterSettings(): ClusterNode[] {
        return [{ host: process.env.redisHost, port: Number(process.env.redisPort) }];
    }
    public static get redisCacheKeyPrefix() {
        return process.env.redisCacheKeyPrefix;
    }
    public static get OrganizationDetailsPageSize() {
        return 10000;
    }
    public static get isRedisCachingEnabledForOrganizationDetails() {
        return process.env.isRedisCachingEnabledForOrganizationDetails === "true";
    }
    public static get isRequestDetailsFromProvisioningEnabled(){
        return process.env.requestDetailsFromProvisioningEnabled === "true";
    }
}


