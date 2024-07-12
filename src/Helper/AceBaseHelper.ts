import {getDatabase} from "../Database/AceBaseDatabase";
import {AccountModel} from "../Data/DatabaseModels/AccountModel";
import {DataReference, DataSnapshot} from "acebase";
import {DBItem} from "../Data/DatabaseModels/DBItem";
import {SettingsModel} from "../Data/DataModels/SettingsModel";
import exp from "constants";

export const getNewDBRef = (path: string) => {
    return getDatabase().ref(path).push()
}

export const doPathExist = (path: string) => {
    return new Promise<boolean>((resolve, reject) => {
        getDatabase().ref(path).get((snapshot: DataSnapshot) => {
            resolve(snapshot.exists())
        })
    })
}

export const addDBItem = <T extends DBItem>(path: string, item: T) => {
    return new Promise<DBItem>((resolve, reject) => {
        const db = getDatabase()
        let accountRef: DataReference

        if (!item.uid) {
            accountRef = getNewDBRef(path)
            item.uid = accountRef.key
        } else {
            accountRef = db.ref(path).child(item.uid)
        }
        accountRef.set(item)

        resolve(item)
    })
}

export const deleteDBObject = (path: string) => {
    return new Promise<void>((resolve, reject) => {
        getDatabase().ref(path).remove().then(() => {
            resolve()
        })
    })
}

export const deleteDBItem = <T extends DBItem>(path: string, item: T) => {
    return new Promise<void>((resolve, reject) => {
        getDatabase().ref(path).child(item.uid).remove().then(() => {
            resolve()
        })
    })
}

export const deleteDBItemByUid = (path: string, uid: string) => {
    return new Promise<void>((resolve, reject) => {
        getDatabase().ref(path).child(uid).remove().then(() => {
            resolve()
        })
    })
}

export const updateDBItem = <T extends DBItem>(path: string, item: T) => {
    return new Promise<void>((resolve, reject) => {
        getDatabase().ref(path).child(item.uid).update(item).then(() => {
            resolve()
        })
    })
}

export const getDBItemOnChange = <T extends DBItem>(rootPath: string, itemUid: string, onChange: (item: T | null) => void) => {
    getDatabase().ref(rootPath).child(itemUid).on('value', (snapshot: DataSnapshot) => {
        if (!snapshot.exists()) {
            onChange(null)
            return;
        }
        onChange(snapshot.val() as T)
    })
}

export const getDBItemsOnChange = <T extends DBItem>(path: string, onChange: (item: T[]) => void) => {
    getDatabase().ref(path).on('value', (snapshot: DataSnapshot) => {
        if (!snapshot.exists()) {
            onChange([])
            return;
        }
        const items: T[] = []
        Object.values(snapshot.val()).forEach((account) => {
            items.push(account as T)
            return true
        })
        onChange(items)
    })
}

export const getDBItemByUid = <T extends DBItem>(path: string, uid: string) => {
    return new Promise<T | null>((resolve, reject) => {
        getDatabase().ref(path).child(uid).get((snapshot: DataSnapshot) => {
            if (!snapshot.exists()) {
                resolve(null)
                return;
            }
            resolve(snapshot.val())
        })
    })
}

export const getDBObject = (path: string) => {
    return new Promise<any | null>((resolve, reject) => {
        getDatabase().ref(path).get((snapshot: DataSnapshot) => {
            if (!snapshot.exists()) {
                resolve(null)
                return;
            }
            resolve(snapshot.val())
        })
    })
}

export const getDBObjectOnChange = <T>(path: string, onChange: (item: T | null) => void) => {
    getDatabase().ref(path).on("value", (snapshot: DataSnapshot) => {
        if (!snapshot.exists()) {
            onChange(null)
            return;
        }
        onChange(snapshot.val())
    })
}

export const setDBObject = <T>(path: string, item: T) => {
    return new Promise<T>((resolve, reject) => {
        getDatabase().ref(path).set(item).then(() => {
            resolve(item)
        })
    })
}