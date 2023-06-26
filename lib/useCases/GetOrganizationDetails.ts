import { Configurations } from "@config";
import { CacheKeyType } from "@models/Enums/CacheKey";
import { RedisCache } from "@services/cache/RedisCache";
import { GcsClient } from "@services/clients/GcsClient";
import { Logger } from "@services/logger";
import { GraphQLClient } from "graphql-request";

export class GetOrganizationDetails {
  gcsClient: GcsClient;
  constructor() {
    this.gcsClient = new GcsClient(new GraphQLClient(`${Configurations.getGCSUrl}/api/v1`));
  }
  async allOrganizationDetails() {
    try {
      const cacheKey = CacheKeyType.allOrganizationDetail;
      let cachedResponse = await this.getDataFromCache(cacheKey);
      if (!cachedResponse) {
        const allOrgDetails = await this.allOrganizationDetailsFromGcs();
        const orgDetails = allOrgDetails.map((org) => ({
          orgUrn: org.orgUrn,
          details: {
            orgUrn: org.orgUrn,
            companyName: org.name,
            accountNumber: org.accountNumber,
            enterpriseID: org.enterpriseId,
            orgID: org.orgID
          },}));
        this.saveDataToCache(CacheKeyType.allOrganizationDetail, JSON.stringify({ Org: orgDetails }));
        return orgDetails;
      } else {
        return JSON.parse(cachedResponse)?.Org;
      }
    } catch (error) {
      Logger.error("GetOrganizationDetails allOrganizationDetails", error);
      return null;
    }
  }
  async allOrganizationDetailsFromGcs() {
    try {
      let pageSize = Configurations.OrganizationDetailsPageSize;
      return await this.gcsClient.getAllOrganizationDetails(pageSize);
    } catch (error) {
      Logger.error("GetOrganizationDetails allOrganizationDetailsFromGcs", error);
      return null;
    }
  }
  async detailsFromGcsByOrgUrns(orgUrns: string[]) {
    try {
      let organizationDetailsFromGcs = await this.gcsClient.getOrganizationDetailsByUrns(orgUrns);
      if (organizationDetailsFromGcs) {
        const orgDetails = organizationDetailsFromGcs.map((org) => ({
          orgUrn: org.orgUrn,
          details: {
            orgUrn: org.orgUrn,
            companyName: org.name,
            accountNumber: org.accountNumber,
            orgID:org.orgID,
          },}));
        this.upsertToCache(CacheKeyType.allOrganizationDetail, orgDetails);
        return orgDetails;
      } else{
        return null;
      }
    } catch (error) {
      Logger.error("GetOrganizationDetails detailsFromGcsByOrgUrns", error);
      return null;
    }
  }
  async saveDataToCache(cacheKey: string, data: any, cacheExpiry?: number) {
    try {
      cacheExpiry = cacheExpiry ? cacheExpiry : -1;
      const cacheIntervalInSeconds = cacheExpiry && cacheExpiry === -1 ? null : 60 * cacheExpiry;
      if (Configurations.isRedisCachingEnabledForOrganizationDetails) {
        const redisCache = await RedisCache.getInstance();
        await redisCache.save(cacheKey, data, cacheIntervalInSeconds);
      }
    } catch (error) {
      Logger.error("GetOrganizationDetails saveDataToCache", error);

      return null;
    }
  }
  async getDataFromCache(cacheKey: any) {
    try {
      if (Configurations.isRedisCachingEnabledForOrganizationDetails) {
        const redisCache = await RedisCache.getInstance();
        return await redisCache.get(cacheKey);
      } else return null;
    } catch (error) {
      Logger.error("GetOrganizationDetails getDataFromCache", error);

      return null;
    }
  }
  async upsertToCache(cacheKey: string, data: any[], cacheExpiry = -1) {
    try {
      if (!Configurations.isRedisCachingEnabledForOrganizationDetails) {
        return;
      }
      const redisCache = await RedisCache.getInstance();
      const cachedData = await redisCache.get(cacheKey);
      const updatedOrgDetails = cachedData
        ? [...JSON.parse(cachedData)?.Org, ...data]
        : data;
      const cacheIntervalInSeconds = cacheExpiry === -1 ? null : 60 * cacheExpiry;
      const logMessage = cachedData
        ? "upsertDataToCache.update to db"
        : "saving to db";
        Logger.logInfo("GetOrganizationDetails", "upsertDataToCache",`${logMessage} data: ${JSON.stringify(data)}`);
      await redisCache.save(cacheKey, JSON.stringify({ Org: updatedOrgDetails }), cacheIntervalInSeconds);
    } catch (error) {
      Logger.error("GetOrganizationDetails upsertDataToCache", error);
      return null;
    }
  }
}