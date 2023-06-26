import {Entity,PrimaryGeneratedColumn,Column,BaseEntity} from "typeorm";
@Entity("request_subscriptions_validation_details")
export class RequestSubscriptionValidationDetails extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  requestSubscriptionsId: number;
  @Column()
  validationMessage: string;
  @Column()
  createdOn: Date;
  @Column()
  requestUrn: string;
  @Column()
  subscriptionUrn: string;
  @Column()
  errorCode: string;

}