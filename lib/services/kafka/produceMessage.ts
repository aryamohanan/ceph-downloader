import { Configurations } from "@config";
import { Logger } from "@services/logger";
import {Producer} from "node-rdkafka";
export class GetKafkaProducer {
  
  private static _producer:Producer;
  private static isProducerConnected = false;
  private static kafkaConnectionInterval = 1000 * 60 * 1; // one minute

  static call(): Promise<Producer> {
    return new Promise((resolve, reject) => {
      if (this._producer && this.isProducerConnected) {
        return resolve(this._producer);
      }
      console.warn('creating new producer');
      let producer = new Producer(
        {
          ...Configurations.KafkaProducerSettings,
          'dr_msg_cb': true
        },
        { 'request.required.acks': 1}
      )
      this._producer = producer;
      producer.connect(null, (err) => {
        if (err) {
          console.error("Error on Producer Connect => :", err);
          this.isProducerConnected = false;
          this.handleKafkaDown();
          reject(err);
        }
      });

      producer.on('ready', () => {
        console.warn('producer ready');
        this.isProducerConnected = true;
        this.handleKafkaDown();
        resolve(producer);
      });
      
      producer.on('event.error', (error) => {
        console.error(`Error(Event) on Producer => : ${JSON.stringify(error)}`);
        this._producer.disconnect();
        this._producer.setPollInterval(0);
        this.isProducerConnected = false;
        reject(error);
      });

      producer.setPollInterval(200);
      producer.on('delivery-report', function(err, report) {
        // Report of delivery statistics here:
        try{  
          Logger.logDetails("GetKafkaProducer",`Acknowledgement received from topic:${report.topic}`)    
        }
        catch(error){
          Logger.errorDetails("GetKafkaProducer","delivery-report",error);
        }
      });
    });
  }

  static handleKafkaDown() {
    setTimeout(() => {
      console.log('checking producer connection');
      if (!this.isProducerConnected){
        console.log('connecting producer again');
        this._producer.connect(null, (err) => {
          if (err) {
            console.error("Error on Producer Creation => :", err);
            this.handleKafkaDown();
          } else {    
            this._producer.setPollInterval(200);
          }
        });
      } else {
        this.handleKafkaDown();
      }
    }, this.kafkaConnectionInterval);
  }
  static resetKafkaProducer() {
    this._producer = null;
    return GetKafkaProducer.call();
  }
}

const DEFAULT_PARTITION = null;

export class ProduceKafkaMessage {
  private producer: Producer;
  constructor(producer:Producer){
    this.producer = producer;
  }

  static async call(message:any, topic:string, partition = DEFAULT_PARTITION){
    const producer = await GetKafkaProducer.call();
    const instance = new ProduceKafkaMessage(producer);
    return instance.call(message, topic, partition);
  }
  async call(message: any, topic: string, partition = DEFAULT_PARTITION): Promise<any> {
    try {
      await (this.producer.produce(topic, partition, message.valueBuffer, message.keyBuffer));
      return true;
    }
    catch (error) {
      Logger.error("ProduceKafkaMessage.call", `Error while publishing message ${JSON.stringify(message.value)}, ${error}`);
      this.producer = null;
      this.producer = await GetKafkaProducer.resetKafkaProducer();
      return this.producer.produce(topic, partition, message.valueBuffer, message.keyBuffer).then(() => true)
        .catch((error) => {
          Logger.error('ProduceKafkaMessage.call', `Error occured during retry of publish message ${JSON.stringify(message.value)}. Error: ${error}`);
          throw error;
        });
    }
  }
}
