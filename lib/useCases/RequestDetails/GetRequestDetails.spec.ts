import { GdsClient } from '@services/clients/GdsClient';
import { GcsClient } from '@services/clients/GcsClient';
import { GetRequestDetails } from "./GetRequestDetails";
import { FakeRequests } from '@tests/helpers/fakeRequest';
import { RequestSubscription } from '@models/RequestSubscription';
import { ProvisioningRequestsListOfSims } from '@useCases/ProvisioningRequestsListOfSims';

const testSubject: GetRequestDetails = new GetRequestDetails(GdsClient.prototype, GcsClient.prototype)
const getSubscriptionsByField = FakeRequests.gdsGetSubscriptionsByField();
const getCostCentersByUrns = [];
const mockRequest = FakeRequests.generateFakeRequestDetails();
const mockRequestSubscription = FakeRequests.generateFakeRequestSubscription();
jest.spyOn(GdsClient.prototype, 'getSubscriptionsByField').mockResolvedValue(getSubscriptionsByField);
jest.spyOn(GcsClient.prototype, 'getCostCentersByUrns').mockResolvedValue(getCostCentersByUrns);
jest.spyOn(RequestSubscription, 'getByRequestUrn').mockResolvedValue(mockRequestSubscription);
const provisioningRequestsListOfSims = new ProvisioningRequestsListOfSims;
const fakeRequestDetailsFromParsecAPI = FakeRequests.generateFakeRequestDetailsFromParsecAPI();
jest.spyOn(provisioningRequestsListOfSims, 'requestDetailsFromParsecAPI').mockResolvedValue(fakeRequestDetailsFromParsecAPI);


describe('When fetching request details with parsec request', () => {
    it('should get request from getSubscriptionDetails method', async (done) => {
        const mockFilter = { requestUrn: "cmp-cpro-request-27580"};
        jest.spyOn(testSubject, 'fetchRequestDetailsFromParsecAPI');
        const response = await testSubject.setResponse(mockRequest[0],mockFilter);
        expect(testSubject.fetchRequestDetailsFromParsecAPI).not.toBeCalled();
        expect(response).toBeTruthy();
        done();
    });
    it('should get request from fetchRequestDetailsFromParsecAPI method if error occurs', async (done) => {
        const mockFilter = { requestUrn: "cmp-cpro-request-49503"};
        jest.spyOn(testSubject,'getSubscriptionDetails').mockRejectedValue(new Error());
        jest.spyOn(testSubject, 'fetchRequestDetailsFromParsecAPI').mockResolvedValue(fakeRequestDetailsFromParsecAPI)
        const response = await testSubject.setResponse(mockRequest[0],mockFilter);
        expect(testSubject.fetchRequestDetailsFromParsecAPI).toBeCalled();
        expect(response).toBeTruthy();
        done();
    })
});

describe('When fetching request details with legacy request', () => {
    const mockFilter = { requestUrn: "cmp-pp-request-49482"};
    jest.spyOn(testSubject, 'fetchRequestDetailsFromParsecAPI').mockResolvedValue(fakeRequestDetailsFromParsecAPI)
    it('should get request from fetchRequestDetailsFromParsecAPI method', async (done) => {
        const response = await testSubject.fetchRequestDetailsFromParsecAPI(mockFilter);
        expect(response).toBeTruthy();
        done(); 
    });
});