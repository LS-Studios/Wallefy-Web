export class DistributionModel {
    transactionPartnerUid: string;
    percentage: number;

    constructor(transactionPartnerUid: string, percentage: number) {
        this.transactionPartnerUid = transactionPartnerUid;
        this.percentage = percentage;
    }
}