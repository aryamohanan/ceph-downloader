import { Status } from '@models/Enums/Status';
import { Logger } from '@services/logger';
const axios = require('axios');

export class ParsecClient {
	baseUrl: string;
	private actionUrls;
	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
		this.actionUrls = {
			get: `${this.baseUrl}/api/v1/Provisioning`,
		};
	}

	public getRequestDetails(queryParam): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      axios
        .get(`${this.actionUrls.get}?${queryParam}`)
        .then(function (response) {
          if (response.status == Status.green) resolve(response.data);
          else reject(response.data);
        })
        .catch(function (error) {
          reject(error);
		  Logger.error("ParsecClient getRequestDetails", error);
        });
    });
    return promise;
  }
}
