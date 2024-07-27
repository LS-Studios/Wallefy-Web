import {DBItem} from "../../Data/DatabaseModels/DBItem";
import {AccountModel} from "../../Data/DatabaseModels/AccountModel";
import {UserDataModel} from "../../Data/DatabaseModels/UserDataModel";
import {LinkInvite} from "../../Data/DataModels/LinkInvite";

export interface DatabaseHelper {
    getNewDBRef: (path: string) => any,
    doPathExist: (path: string) => Promise<boolean>,
    addDBItem: <T extends DBItem>(path: string, item: T) => Promise<T>,
    deleteDBObject: (path: string) => Promise<void>,
    deleteDBItem: <T extends DBItem>(path: string, item: T) => Promise<void>,
    deleteDBItemByUid: (path: string, uid: string) => Promise<void>,
    updateDBItem: <T extends DBItem>(path: string, item: T) => Promise<void>,
    getDBItemOnChange: <T extends DBItem>(rootPath: string, itemUid: string, onChange: (item: T | null) => void) => void,
    getDBItemsOnChange: <T extends DBItem>(path: string, onChange: (items: T[]) => void) => void,
    getDBItems: <T extends DBItem>(path: string) => Promise<T[]>,
    getDBItemByUid: <T extends DBItem>(path: string, uid: string) => Promise<T | null>,
    getDBObject: (path: string) => Promise<any | null>,
    getDBObjects: (path: string) => Promise<any[]>,
    getDBObjectOnChange: (path: string, onChange: (item: any | null) => void) => void,
    getDBObjectsOnChange: (path: string, onChange: (items: any[]) => void) => void,
    setDBObject: (path: string, item: any) => Promise<any>,
    addDBObject: (path: string, item: any) => Promise<any>,
    getDBLinkInvite: (inviteUid?: string, accountUid?: string) => Promise<LinkInvite | null>,
    getDBUserByUid: (uid: string) => Promise<UserDataModel | null>,
    dbLogin: (email: string, password: string, newAccount: AccountModel) => Promise<UserDataModel>,
    dbLogout: () => Promise<void>
    dbSignUp: (user: UserDataModel, password: string, newAccount: AccountModel) => Promise<UserDataModel>

}