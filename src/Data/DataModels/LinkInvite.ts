export class LinkInvite {
    linkUid: string;
    accountUid: string;
    accountName: string;

    constructor(linkUid: string, accountUid: string, accountName: string) {
        this.linkUid = linkUid;
        this.accountUid = accountUid;
        this.accountName = accountName;
    }
}