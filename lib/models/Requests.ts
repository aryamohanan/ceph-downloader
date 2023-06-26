import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, getConnection, CreateDateColumn, In } from "typeorm";


@Entity("requests")
export class Requests extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    legacyRequestId: number;
    @Column()
    status: string;
    @Column(process.env.NODE_ENV == "test" ? "simple-json" : "json")
    payload: any;
    @Column({ nullable: true })
    errorLogs: string;
    @Column({ nullable: true })
    requestUrn: string;
    @Column({ nullable: true })
    profileUrn: string;
    @Column({ nullable: true })
    completionStatus: string;
    @CreateDateColumn()
    dateCreated: Date;
    @Column({ nullable: true })
    dateCompleted: Date;
    @Column({ nullable: true })
    requireCarrierCall: boolean = true;
    @Column({ nullable: true })
    requestType: string;
    @Column({ nullable: true })
    onhold: boolean;
    @Column({ nullable: true })
    excludeCarrierSteps: boolean;
    @Column({ nullable: true })
    fileName: string;
    @Column({ nullable: true })
    numberOfSubscriptions: number;
    @Column({ nullable: true })
    requestNotes: string;
    @Column({ nullable: true })
    orgUrn: string;
    @Column({ nullable: true })
    requestCategory: string;
    @Column({ nullable: true })
    serviceTypeId: number;

    static async getByRequestUrns(requestUrns: string[]) {
        const requestDetails =  await Requests.find({
          requestUrn: In(requestUrns),
        });
        return requestDetails
      }
    static getByRequestUrn(requestUrn: string) {
      return Requests.findOne({ requestUrn });
    }
    static getByLegacyRequestId(legacyRequestId: number) {
      return Requests.findOne({ legacyRequestId });
    }
}