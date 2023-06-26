import { FakeRequests } from '@tests/helpers/fakeRequest';
import { CEPHService } from './CEPHService';


jest.mock('minio', () => {
  return {
    Client: jest.fn(() => {
      return {
        getObject: jest.fn((bucketName, path, cb) => {
          const dataStream = {
            on: jest.fn((event, cb) => {
              if (event === 'data') {
                cb(Buffer.from(JSON.stringify(FakeRequests.generateFakeCephData())));
              } else if (event === 'end') {
                cb();
              }
            })
          };
          cb(null, dataStream);
        })
      };
    })
  };
});

jest.mock('xlsx', () => {
  return {
    read: jest.fn((buffer, options) => {
      return {
        SheetNames: [ 'sheet1' ],
        Sheets: {
          sheet1: {
            'A1': { v: 'ICCID' },
            'B1': { v: 'IMEI' },
            'A2': { v: '8910393335128660025' },
            'B2': { v: '' },
            'A3': { v: '8910393335128660070' },
            'B3': { v: '' }
          }
        }
      };
    }),
    utils: {
      sheet_to_json: jest.fn((worksheet, options) => {
        return FakeRequests.generateFakeCephData();
      })
    }
  };
});

describe('CEPHService', () => {
  it('should return data from CEPH file', async () => {
    const result = await CEPHService.getDataFromCephFile('', 'bucket1', 'file.xlsx');
    expect(result).toEqual(FakeRequests.generateFakeCephData());
  });
});
