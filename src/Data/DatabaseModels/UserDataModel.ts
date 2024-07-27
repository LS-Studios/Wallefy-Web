import {DBItem} from "./DBItem";
import {AccountVisibilityType} from "../EnumTypes/AccountVisibilityType";

export class UserDataModel implements DBItem {
    uid: string = ""
    name: string = ""
    email: string = ""

    constructor(name: string, email: string, uid?: string) {
        this.name = name
        this.email = email
        this.uid = uid || ""
    }
}