import {ProduceKafkaMessage } from "@services/kafka/produceMessage";
import { instance, when, verify, anything, mock } from 'ts-mockito';
import { PublishToKafka } from "./publishToKafka";
import { FakeRequests } from "@tests/helpers/fakeRequest";

describe('PublishToKafka',() => {
     const kafkaProducerMock = mock(ProduceKafkaMessage);
     const kafkaProducerMockInstace = instance(kafkaProducerMock);
     const testSubject = new PublishToKafka(kafkaProducerMock);
     testSubject.produceKafkaMessage = kafkaProducerMockInstace;
  it('should call produceKafkaMessage with the correct parameters', async () => {
      when(kafkaProducerMock.call(anything(), anything())).thenResolve(null)
      await testSubject.call(FakeRequests.generateFakeDownloaderEvent())
      verify(kafkaProducerMock.call(anything(), anything())).called()
  })
});