import {getAceBaseDatabase} from "../../Database/AceBaseDatabase";
import {AccountModel} from "../../Data/DatabaseModels/AccountModel";
import {DataReference, DataSnapshot, EventStream} from "acebase";
import {DBItem} from "../../Data/DatabaseModels/DBItem";
import {SettingsModel} from "../../Data/DataModels/SettingsModel";
import {DatabaseRoutes} from "../DatabaseRoutes";
import {UserModel} from "../../Data/DatabaseModels/UserModel";
import {AccountType} from "../../Data/EnumTypes/AccountType";
import {getDefaultDebtPresets, getDefaultPresets} from "../DefaultPresetHelper";
import {DatabaseHelper} from "./DatabaseHelper";
import {addPresetsForAccount, createNewUser, getActiveDatabaseHelper} from "./ActiveDBHelper";
import {DatabaseType} from "../../Data/EnumTypes/DatabaseType";

export class AceBaseHelper implements DatabaseHelper {

    getNewDBRef(path: string): any {
        return getAceBaseDatabase().ref(path).push();
    }

    doPathExist(path: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            getAceBaseDatabase().ref(path).get().then((snapshot: DataSnapshot) => {
                resolve(snapshot.exists());
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    addDBItem<T extends DBItem>(path: string, item: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const db = getAceBaseDatabase();
            let newRef: DataReference;

            if (!item.uid) {
                newRef = this.getNewDBRef(path);
                item.uid = newRef.key!;
            } else {
                newRef = db.ref(path).child(item.uid);
            }
            newRef.set(item).then(() => {
                resolve(item);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    deleteDBObject(path: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            getAceBaseDatabase().ref(path).remove().then(() => {
                resolve();
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    deleteDBItem<T extends DBItem>(path: string, item: T): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            getAceBaseDatabase().ref(path).child(item.uid).remove().then(() => {
                resolve();
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    deleteDBItemByUid(path: string, uid: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            getAceBaseDatabase().ref(path).child(uid).remove().then(() => {
                resolve();
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    updateDBItem<T extends DBItem>(path: string, item: T): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            getAceBaseDatabase().ref(path).child(item.uid).update(item).then(() => {
                resolve();
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    getDBItemOnChange<T extends DBItem>(rootPath: string, itemUid: string, onChange: (item: T | null) => void) {
        getAceBaseDatabase().ref(rootPath).child(itemUid).on('value', (snapshot: DataSnapshot) => {
            if (!snapshot.exists()) {
                onChange(null);
                return;
            }
            onChange(snapshot.val() as T);
        });
    }

    getDBItemsOnChange<T extends DBItem>(path: string, onChange: (item: T[]) => void) {
        getAceBaseDatabase().ref(path).on('value', (snapshot: DataSnapshot) => {
            if (!snapshot.exists()) {
                onChange([]);
                return;
            }
            const items: T[] = [];
            Object.values(snapshot.val()).forEach((account) => {
                items.push(account as T);
            });
            onChange(items);
        });
    }

    getDBItemByUid<T extends DBItem>(path: string, uid: string): Promise<T | null> {
        return new Promise<T | null>((resolve, reject) => {
            getAceBaseDatabase().ref(path).child(uid).get().then((snapshot: DataSnapshot) => {
                if (!snapshot.exists()) {
                    resolve(null);
                    return;
                }
                resolve(snapshot.val());
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    getDBObject(path: string): Promise<any | null> {
        return new Promise<any | null>((resolve, reject) => {
            getAceBaseDatabase().ref(path).get().then((snapshot: DataSnapshot) => {
                if (!snapshot.exists()) {
                    resolve(null);
                    return;
                }
                resolve(snapshot.val());
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    getDBObjects(path: string): Promise<any[]> {
        return new Promise<any | null>((resolve, reject) => {
            getAceBaseDatabase().ref(path).get().then((snapshot: DataSnapshot) => {
                if (!snapshot.exists()) {
                    resolve([]);
                    return;
                }
                const items: any[] = [];
                Object.values(snapshot.val()).forEach((account) => {
                    items.push(account);
                });
                resolve(items);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    getDBObjectOnChange(path: string, onChange: (item: any | null) => void) {
        getAceBaseDatabase().ref(path).on("value", (snapshot: DataSnapshot) => {
            if (!snapshot.exists()) {
                onChange(null);
                return;
            }
            onChange(snapshot.val());
        });
    }

    setDBObject(path: string, item: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            getAceBaseDatabase().ref(path).set(item).then(() => {
                resolve(item);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    dbLogin(email: string, password: string): Promise<UserModel> {
        return new Promise<UserModel>((resolve, reject) => {
            this.getDBObject(DatabaseRoutes.USERS).then((users: UserModel[]) => {
                if (users === null) {
                    reject();
                    return;
                }
                const user = Object.values(users).find((user: UserModel) => {
                    return user.email === email && user.password === password;
                });
                if (user === undefined) {
                    reject();
                    return;
                }
                resolve(user);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    dbLogout(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            getActiveDatabaseHelper(DatabaseType.ACE_BASE).setDBObject(DatabaseRoutes.SETTINGS, new SettingsModel()).then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
    }

    dbSignUp(user: UserModel, newAccount: AccountModel): Promise<UserModel> {
        return new Promise<UserModel>((resolve, reject) => {
            this.doPathExist(DatabaseRoutes.USERS).then((pathExist) => {
                const createUser = () => {
                    createNewUser(user, newAccount).then((user: UserModel) => {
                        resolve(user);
                    })
                };

                if (!pathExist) {
                    createUser();
                } else {
                    this.getDBObject(DatabaseRoutes.USERS).then((users: UserModel[]) => {
                        const existingUser = Object.values(users).find((existingUser: UserModel) => {
                            return existingUser.email === user.email;
                        });
                        if (existingUser !== undefined) {
                            reject();
                            return;
                        }
                        createUser();
                    }).catch((error) => {
                        reject(error);
                    });
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }
}
