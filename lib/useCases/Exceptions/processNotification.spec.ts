import { GetKafkaProducer, ProduceKafkaMessage } from "@services/kafka/produceMessage";
import { Producer } from "node-rdkafka";
import { anything, mock, verify, when } from "ts-mockito";
import { ProcessNotification } from "./processNotification";

describe("When ProcessNotification is processing a notification event", () => {
    const testSubject = new ProcessNotification();
    let mockProduceKafkaMessage = mock(ProduceKafkaMessage);
    when(mockProduceKafkaMessage.call(anything(), anything())).thenResolve(
      true
    );  
    describe("with invalid notification event", () => {
        it("should not publish notification event", async () => {
          GetKafkaProducer.call = jest.fn(async () => {
                return mock(Producer);
            });
            await testSubject.call(null);
            verify(mockProduceKafkaMessage.call(anything(), anything())).never();
        });
    });
     describe("with valid notification event", () => {
       it("should publish notification event", async () => {
        GetKafkaProducer.call = jest.fn(async () => {
           return mock(Producer);
         });        
         const testCase = {
           eventName: "CEPH API call failed",
           eventType: "ApiCallFailed",
           happenedOn: "2022-05-26T07:20:01.713Z",
           payload: {
             grayLogSearchQuery: "rangetype=relative&fields=message%2Csource&width=1536&highlightMessage=&relative=1800&q=%22Exception%20generated%20from%20EventHandler%20call%20method%2C%20error%3A%20Error%3A%20CEPH-OUTAGE%22",
             message: "GDS API call failed with errorCode: 404 ",
           },
         };
          testSubject.call(testCase);
         verify(mockProduceKafkaMessage.call(anything(), anything())).once;
       });
    });
});