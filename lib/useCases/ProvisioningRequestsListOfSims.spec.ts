import { Requests } from "@models/Requests";
import { ParsecClient } from "@services/clients/ParsecClient";
import { FakeRequests } from "@tests/helpers/fakeRequest";
import { ProvisioningRequestsListOfSims } from "./ProvisioningRequestsListOfSims";
import { GetRequestDetails } from "./RequestDetails/GetRequestDetails";
import { GdsClient } from "@services/clients/GdsClient";
// this test cases are peachy
const testSubject: ProvisioningRequestsListOfSims = new ProvisioningRequestsListOfSims();
const parsecClientResponse = FakeRequests.generateFakeParsecClientResponse();
jest.spyOn(ParsecClient.prototype, 'getRequestDetails').mockResolvedValue(parsecClientResponse);
describe('When isCategory method is called',()=>{
    it('should return true with valid category',()=>{
        expect(testSubject.isCategory('Provisioning_requests_listofSims')).toEqual(true);
    })
    it('should return false with invalid category',()=>{
        expect(testSubject.isCategory('Provisioning_listofSims')).toEqual(false);
    })
});

describe('When getData method is called with parsec request',()=>{
    const mockFilter = { requestUrn: "cmp-cpro-request-27580"};
    const mockedRequest = FakeRequests.generateFakeRequestDetails();
    jest.spyOn(Requests, 'getByRequestUrn').mockResolvedValue(mockedRequest[0]);
    const mockedListOfSims = FakeRequests.generateFakeListOfSimsResponse();
    GetRequestDetails.call = jest.fn().mockReturnValue(mockedListOfSims);
    it('should call GetRequestDetails call method',async(done)=>{
        const response = await testSubject.getData(mockFilter);
        expect(GetRequestDetails.call).toHaveBeenCalledTimes(1);
        expect(response).toBeTruthy();
        done();
    })
});

describe('When getData method is called with legacy request',()=>{
    const mockFilter = { requestUrn: "cmp-pp-request-49482"};
    jest.spyOn(Requests, 'getByLegacyRequestId').mockResolvedValue(new Requests());
    jest.spyOn(testSubject, 'requestDetailsFromParsecAPI');
    const getSubscriptionsByIccid = FakeRequests.generateFakeGdsSubscriptionByIccidResponse();
    jest.spyOn(GdsClient.prototype, 'subscriptionByIccid').mockResolvedValue(getSubscriptionsByIccid);
    it('should call requestDetailsFromParsecAPI method',async(done)=>{
        const response = await testSubject.getData(mockFilter);
        expect(testSubject.requestDetailsFromParsecAPI).toHaveBeenCalledTimes(1);
        expect(response).toBeTruthy();
        done();
    })
});
