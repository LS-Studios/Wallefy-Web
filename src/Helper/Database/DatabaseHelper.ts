import {DBItem} from "../../Data/DatabaseModels/DBItem";
import {UserModel} from "../../Data/DatabaseModels/UserModel";

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
    getDBItemByUid: <T extends DBItem>(path: string, uid: string) => Promise<T | null>,
    getDBObject: (path: string) => Promise<any | null>,
    getDBObjects: (path: string) => Promise<any[]>,
    getDBObjectOnChange: (path: string, onChange: (item: any | null) => void) => void,
    setDBObject: (path: string, item: any) => Promise<any>,
    dbLogin: (email: string, password: string) => Promise<UserModel>,
    dbLogout: () => Promise<void>
    dbSignUp: (user: UserModel, translate: (key: string) => string) => Promise<UserModel>

}