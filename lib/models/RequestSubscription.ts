import { Entity, PrimaryGeneratedColumn, Column, getConnection, In, Not, UpdateDateColumn } from "typeorm";

@Entity("request_subscriptions")
export class RequestSubscription {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  subscriptionUrn: string;
  @Column()
  requestUrn: string;
  @Column()
  orgUrn: string;
  @Column()
  status: string;
  @Column()
  isValidationSucceeded : boolean;
  @Column()
  isValidated : boolean;
  @Column()
  requestCompletionType : string;
  @UpdateDateColumn()
  lastUpdatedOn: Date;
  @Column()
  dateCompleted: Date;

  static getByRequestUrn(requestUrn: string): Promise<any[]> {
    const query = getConnection('default').createQueryBuilder()
      .select("request_subscriptions.id", "id")
      .addSelect("request_subscriptions.requestUrn", "requestUrn")
      .addSelect("request_subscriptions.subscriptionUrn", "subscriptionUrn")
      .addSelect("request_subscriptions.status", "status")
      .addSelect("request_subscriptions.orgUrn", "orgUrn")
      .addSelect("request_subscriptions.isValidated", "isValidated")
      .addSelect("request_subscriptions.isValidationSucceeded", "isValidationSucceeded")
      .addSelect("request_subscriptions.lastUpdatedOn", "lastUpdatedOn")
      .addSelect("request_subscriptions.dateCompleted", "dateCompleted")
      .addSelect("request_subscriptions.requestCompletionType", "requestCompletionType")
      .addSelect("validation_details.validationMessage", "validationMessage")
      .addSelect("validation_details.errorCode", "errorCode")
       .from('request_subscriptions', 'request_subscriptions')
      .leftJoin('request_subscriptions_validation_details', 'validation_details', 'request_subscriptions.id = validation_details.requestSubscriptionsId ')
      .where("request_subscriptions.requestUrn = :requestUrn", { requestUrn })
      .orderBy("request_subscriptions.id", "ASC");
    return query.getRawMany();
  }

  static async getRequestDetailsByRequestUrn(requestUrn: string) {
    const query = getConnection('default').createQueryBuilder()
      .select("subscriptions.id", "id")
      .addSelect("subscriptions.subscriptionUrn", "subscriptionUrn")
      .addSelect("validation_details.validationMessage", "validationMessage")
      .addSelect("validation_details.errorCode", "errorCode")
      .addSelect('count(*) OVER() AS count')
      .from("request_subscriptions", "subscriptions")
      .innerJoin('request_subscriptions_validation_details', 'validation_details', 'subscriptions.id = validation_details.requestSubscriptionsId ')
      .where('subscriptions.requestUrn = :requestUrn', { requestUrn })
      .andWhere('subscriptions.isValidationSucceeded  = :isValidationSucceeded', { isValidationSucceeded: false });
    const result = await query.getRawMany();
    return { data: result };
  }
}
