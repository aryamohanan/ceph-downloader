import { EventHandler } from "./eventHandler";
import { KafkaMessage } from "@models/KafkaMessage";
import { DownloaderEvent } from "@models/DownloaderEvent";
import { MessageProcessingEvents } from "@services/kafka/consumer";
import { ProcessFileUpload } from "./processFileUpload";
import { FakeRequests } from "@tests/helpers/fakeRequest";

describe("EventHandler", () => {
  const eventHandler = new EventHandler();
  const kafkaMessage = { value: '{"EventType":"fileUpload","RequestURNs":["cmp-cpro-request-27580"]}' } as KafkaMessage;
  const processFileUploadMock = new ProcessFileUpload() as jest.Mocked<ProcessFileUpload>;
  processFileUploadMock.isType = jest.fn().mockReturnValue(true);
  processFileUploadMock.call = jest.fn().mockResolvedValue(undefined);
  EventHandler.eventHandlers = [processFileUploadMock];
  it("calls the processFileUpload", async () => {
    jest.spyOn(DownloaderEvent, "fromString").mockReturnValue(FakeRequests.generateFakeDownloaderEvent());
    const finishedListener = jest.fn();
    eventHandler.on(MessageProcessingEvents.finished, finishedListener);
    await eventHandler.call(kafkaMessage);
    expect(DownloaderEvent.fromString).toHaveBeenCalledWith(kafkaMessage.value);
    expect(processFileUploadMock.isType).toHaveBeenCalledWith(FakeRequests.generateFakeDownloaderEvent().eventType);
    expect(processFileUploadMock.call).toHaveBeenCalledWith(FakeRequests.generateFakeDownloaderEvent());
    expect(finishedListener).toHaveBeenCalledWith(kafkaMessage);
  });
});
