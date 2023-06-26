import { ProcessFileUpload } from './processFileUpload';
import { Requests } from '@models/Requests';
import { RequestsFileUploadDetails } from '@models/RequestsFileUploadDetails';
import { CEPHService } from '@services/ceph/CEPHService';
import { PublishToKafka } from './publishToKafka';
import { when, verify, anything, spy, resetCalls } from 'ts-mockito';
import {FakeRequests} from '@tests/helpers/fakeRequest'

describe('When Testing ProcessFileUpload', () => {
  const requests = spy(Requests);
  const requestsFileUploadDetails = spy(RequestsFileUploadDetails)
  const cephService = spy(CEPHService);
  const publishToKafka = spy(PublishToKafka);
  const processFileUpload = new ProcessFileUpload()
  beforeEach(()=>{
    resetCalls(requests)
    resetCalls(requestsFileUploadDetails)
    resetCalls(cephService)
    resetCalls(publishToKafka)
  })
  it('should call cephService and publishToKafka when no mapping count found', async () => {
    const fileUploadMappingDetails = [];
    when(requests.getByRequestUrns(anything())).thenResolve(FakeRequests.generateFakeRequestDetails());
    when(requestsFileUploadDetails.getRequestByRequestURNs(anything())).thenResolve(fileUploadMappingDetails);
    when(cephService.getDataFromCephFile(anything(), anything(), anything())).thenResolve(FakeRequests.generateFakeCephData());
    when(requestsFileUploadDetails.saveFileUploadRequests(anything())).thenResolve(FakeRequests.generateFakeFileUploadRequest());
    await processFileUpload.call(FakeRequests.generateFakeDownloaderEvent());
    verify(cephService.getDataFromCephFile(anything(), anything(), anything())).once();
    verify(publishToKafka.call(anything())).once();
  });

  it('should publishToKafka when all subscriptions are mapped', async () => {
    const fileUploadMappingDetails:any = [{}, {}];
    when(requests.getByRequestUrns(anything())).thenResolve(FakeRequests.generateFakeRequestDetails());
    when(requestsFileUploadDetails.getRequestByRequestURNs(anything())).thenResolve(fileUploadMappingDetails);
    await processFileUpload.call(FakeRequests.generateFakeDownloaderEvent());
   verify(cephService.getDataFromCephFile(anything(), anything(), anything())).never();
   verify(publishToKafka.call(anything())).once();
});
it('should call cephService and publishToKafka when mapping count does not match total number of subscriptions', async () => {
  const fileUploadMappingDetails:any = [{}];
  when(requests.getByRequestUrns(anything())).thenResolve(FakeRequests.generateFakeRequestDetails());
  when(requestsFileUploadDetails.getRequestByRequestURNs(anything())).thenResolve(fileUploadMappingDetails);
  when(cephService.getDataFromCephFile(anything(), anything(), anything())).thenResolve(FakeRequests.generateFakeCephData());
  when(requestsFileUploadDetails.deleteFileUploadRequests(anything())).thenResolve();
  when(requestsFileUploadDetails.saveFileUploadRequests(anything())).thenResolve(FakeRequests.generateFakeFileUploadRequest());
  await processFileUpload.call(FakeRequests.generateFakeDownloaderEvent());
  verify(cephService.getDataFromCephFile(anything(), anything(), anything())).once();
  verify(publishToKafka.call(anything())).once();
});
});