export class InviteModel {
    email: string;
    accountUid: string;
    accountName: string;

    constructor(email: string, accountUid: string, accountName: string) {
        this.email = email;
        this.accountUid = accountUid;
        this.accountName = accountName;
    }
}