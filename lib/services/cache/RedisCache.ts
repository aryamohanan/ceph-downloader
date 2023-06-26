import { Configurations } from "@config";
import { CacheResponseCodes } from "@models/Enums/CacheKey";
import { redisConnectionErrors } from "@models/Enums/HandledExceptions";
import { Logger } from "@services/logger";
import { Cluster } from "ioredis";

export class RedisCache {
  private static instance: RedisCache;
  private client:Cluster;
  constructor(client: Cluster) {
    this.client = client;
  }
  static async connectRedis() {
    let connection: Cluster;
    try {
      connection = await new Cluster(
          Configurations.redisClusterSettings,
          Configurations.redisSettings
      );
      connection.on('error', (error) => {
        Logger.error("RedisCache connectRedis", error);
        RedisCache.clearConnection();
      });
      connection.on('ready', () => {
        Logger.logInfo("RedisCache", "connectRedis", `RedisCache client connected` );
      })
    } catch (error) {
      Logger.error("RedisCache connectRedis", error);
      RedisCache.clearConnection();
      throw error;
    }
    return connection;
  }
  static async getInstance() {
    if (!this.instance) {
      this.instance = new RedisCache(await RedisCache.connectRedis());
    }
    return this.instance;
  }
  static clearConnection() {
    this.instance = null;
  }
  static isConnected() {
    return this.instance !== null;
  }
  async save(key: string, value: any, expiryInSeconds: number) {
    try {
      const redisKey = this.setUpRedisKey(key);
      let result;
      if (expiryInSeconds) {
        result = await this.client.set(
          redisKey,
          value,
          "ex",
          expiryInSeconds
        );
      } else {
        result = await this.client.set(
          redisKey,
          value
        );
      }
      if (result === CacheResponseCodes.OK) {
        Logger.logInfo("RedisCache", "save", `data saved to redis, key: ${redisKey}` );
      } else
        Logger.error(`RedisCache.save ${redisKey}`, new Error(`data failed to save in redis, key: ${redisKey}, result ${result}`));   
      return result;
    } catch (error) {
      Logger.error(`RedisCache.save ${key}`, error);
      this.handleConnectionClosedError(error);
      throw error;
    }
  }
  async get(key: string) {
    try {
      const redisKey = this.setUpRedisKey(key);
      const cachedData = await this.client.get(redisKey);
      if (!cachedData) {
        Logger.logInfo("RedisCache", "get", `expired or no data found in redis for key: ${redisKey}` ); 
      }
      else {
        Logger.logInfo("RedisCache", "get", `data found in redis for key: ${redisKey}` );
      }
      return cachedData;
    } catch (error) {
      Logger.error(`RedisCache.get ${key}`, error);
      this.handleConnectionClosedError(error);
      throw error;
    }
  }
  setUpRedisKey(key: string) {
    return `${Configurations.redisCacheKeyPrefix}${key}`;
  }
  async delete(key: string) {
    try {
      const redisKey = this.setUpRedisKey(key);
      const success = await this.client.del(redisKey);
      if (success) {
        Logger.logInfo("RedisCache", "delete", `data removed from redis, key ${redisKey}` );
        return `Removed ${redisKey}`;
      } else {
        Logger.logInfo("RedisCache", "delete", `REDIS-100:Error: Failed to remove data from redis, key ${redisKey}` );
        return `Failed to remove ${redisKey}`;
      }
    } catch (error) {
      Logger.error(`RedisCache.delete ${key}`, error);	
      this.handleConnectionClosedError(error);
      throw error;
    }
  }

  handleConnectionClosedError(error: any){        
      redisConnectionErrors.forEach(exception => {
          if (error.message && error.message.indexOf(exception) !== -1) {
            RedisCache.clearConnection();
          }
      });
  }
}