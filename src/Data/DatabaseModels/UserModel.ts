import {DBItem} from "./DBItem";

export class UserModel implements DBItem {
    uid: string = ""
    name: string = ""
    email: string = ""
    password: string = ""
    currentAccountUid: string = ""

    constructor(name: string, email: string, password: string) {
        this.name = name
        this.email = email
        this.password = password
    }
}