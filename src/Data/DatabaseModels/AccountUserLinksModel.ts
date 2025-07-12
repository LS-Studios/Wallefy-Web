import {DBItem} from "./DBItem";
import {UserDataModel} from "./UserDataModel";

export class AccountUserLinksModel implements DBItem {
    uid: string;
    name: string | null = null;
    users: {}[] | null;

    constructor(uid: string, users: {}[] | null) {
        this.uid = uid;
        this.users = users
    }
}