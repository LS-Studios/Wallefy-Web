import {DBItem} from "../../Data/DatabaseModels/DBItem";
import {query, equalTo, orderByChild,  ref, get, child, push, set, remove, update, onValue} from "firebase/database";
import {getFirebaseAuth, getFirebaseDatabase} from "../../Database/FirebaseDatabase";
import {signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile} from "firebase/auth";
import {DatabaseRoutes} from "../DatabaseRoutes";
import {SettingsModel} from "../../Data/DataModels/SettingsModel";
import {DatabaseHelper} from "./DatabaseHelper";
import {AccountModel} from "../../Data/DatabaseModels/AccountModel";
import {addPresetsForAccount, createNewUser, getActiveDatabaseHelper} from "./ActiveDBHelper";
import {DatabaseType} from "../../Data/EnumTypes/DatabaseType";
import {UserDataModel} from "../../Data/DatabaseModels/UserDataModel";
import {LinkInvite} from "../../Data/DataModels/LinkInvite";

export class FirebaseHelper implements DatabaseHelper {
    getNewDBRef(path: string): any {
        return push(ref(getFirebaseDatabase(), path))
    }

    doPathExist(path: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            get(ref(getFirebaseDatabase(), path)).then((snapshot) => {
                resolve(snapshot.exists())
            }).catch((error) => {
                reject(error)
            });
        })
    }

    addDBItem<T extends DBItem>(path: string, item: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const dbRef = ref(getFirebaseDatabase(), path)
            let newRef

            if (!item.uid) {
                newRef = this.getNewDBRef(path)
                item.uid = newRef.key!
            } else {
                newRef = child(dbRef, item.uid)
            }

            set(newRef, item).then(() => {
                resolve(item)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    deleteDBObject(path: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            remove(ref(getFirebaseDatabase(), path)).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            });
        })
    }

    deleteDBItem<T extends DBItem>(path: string, item: T): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            remove(child(ref(getFirebaseDatabase(), path), item.uid)).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            });
        })
    }

    deleteDBItemByUid(path: string, uid: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            remove(child(ref(getFirebaseDatabase(), path), uid)).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            });
        })
    }

    updateDBItem<T extends DBItem>(path: string, item: T): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            update(child(ref(getFirebaseDatabase(), path), item.uid), item).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            });
        })
    }

    getDBItemOnChange<T extends DBItem>(rootPath: string, itemUid: string, onChange: (item: T | null) => void): void {
        onValue(child(ref(getFirebaseDatabase(), rootPath), itemUid), (snapshot) => {
            if (!snapshot.exists()) {
                onChange(null)
                return;
            }
            onChange(snapshot.val())
        })
    }

    getDBItemsOnChange<T>(path: string, onChange: (items: T[]) => void): void {
        onValue(ref(getFirebaseDatabase(), path), (snapshot) => {
            if (!snapshot.exists() || !snapshot.val()) {
                onChange([])
                return;
            }
            const items: T[] = []
            Object.values(snapshot.val()).forEach((childSnapshot: any) => {
                items.push(childSnapshot)
                return true
            })
            onChange(items)
        })
    }

    getDBItems<T>(path: string): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            get(ref(getFirebaseDatabase(), path)).then((snapshot) => {
                if (!snapshot.exists() || !snapshot.val()) {
                    resolve([])
                    return;
                }
                const items: T[] = []
                Object.values(snapshot.val()).forEach((childSnapshot: any) => {
                    items.push(childSnapshot)
                    return true
                })
                resolve(items)
            }).catch((error) => {
                reject(error)
            });
        })
    }

    getDBItemByUid<T extends DBItem>(path: string, uid: string): Promise<T | null> {
        return new Promise<T | null>((resolve, reject) => {
            get(child(ref(getFirebaseDatabase(), path), uid)).then((snapshot) => {
                if (!snapshot.exists()) {
                    resolve(null)
                    return;
                }
                resolve(snapshot.val())
            }).catch((error) => {
                reject(error)
            });
        })
    }

    getDBObject(path: string): Promise<any | null> {
        return new Promise<any | null>((resolve, reject) => {
            get(ref(getFirebaseDatabase(), path)).then((snapshot) => {
                if (!snapshot.exists()) {
                    resolve(null)
                    return;
                }
                resolve(snapshot.val())
            }).catch((error) => {
                reject(error)
            });
        })
    }

    getDBObjects(path: string): Promise<any[]> {
        return new Promise<any | null>((resolve, reject) => {
            get(ref(getFirebaseDatabase(), path)).then((snapshot) => {
                if (!snapshot.exists() || !snapshot.val()) {
                    resolve([])
                    return;
                }
                const items: any[] = []

                Object.values(snapshot.val()).forEach((childSnapshot: any) => {
                    items.push(childSnapshot)
                    return true
                })
                resolve(items)
            }).catch((error) => {
                reject(error)
            });
        })
    }

    getDBObjectOnChange(path: string, onChange: (item: any | null) => void): void {
        onValue(ref(getFirebaseDatabase(), path), (snapshot) => {
            if (!snapshot.exists()) {
                onChange(null)
                return;
            }
            onChange(snapshot.val())
        }, (error) => {
            onChange(null)
        })
    }

    getDBObjectsOnChange(path: string, onChange: (items: any[]) => void): void {
        onValue(ref(getFirebaseDatabase(), path), (snapshot) => {
            if (!snapshot.exists() || !snapshot.val()) {
                onChange([])
                return;
            }
            const items: any[] = []
            Object.values(snapshot.val()).forEach((childSnapshot: any) => {
                items.push(childSnapshot)
                return true
            })
            onChange(items)
        })
    }

    setDBObject(path: string, item: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            set(ref(getFirebaseDatabase(), path), item).then(() => {
                resolve(item)
            }).catch((error) => {
                reject(error)
            });
        })
    }

    addDBObject(path: string, item: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const newRef = this.getNewDBRef(path)
            set(newRef, item).then(() => {
                resolve(item)
            }).catch((error) => {
                reject(error)
            });
        })
    }

    dbLogin(email: string, password: string, newAccount: AccountModel): Promise<UserDataModel> {
        return new Promise<UserDataModel>((resolve, reject) => {
            signInWithEmailAndPassword(getFirebaseAuth(), email, password).then((userCredential) => {
                this.getDBObject(`${DatabaseRoutes.USER_DATA}/${userCredential.user.uid}`).then((user: UserDataModel | null) => {
                    if (user) {
                        resolve(user)
                    } else {
                        createNewUser(
                            new UserDataModel(
                                userCredential.user.displayName || "",
                                email,
                                userCredential.user.uid,
                            ),
                            newAccount
                        ).then((newDBUser) => {
                            resolve(newDBUser)
                        }).catch((error) => {
                            reject(error)
                        })
                    }
                })
            }).catch((error) => {
                reject(error)
            });
        })
    }
    //auth != null && auth.uid == $uid
    getDBLinkInvite(inviteUid?: string, accountUid?: string): Promise<LinkInvite | null> {
        return new Promise<LinkInvite | null>((resolve, reject) => {
            let userQuery

            if (inviteUid) {
                userQuery = query(ref(getFirebaseDatabase(), DatabaseRoutes.PUBLIC_ACCOUNT_LINK_INVITES), orderByChild("linkUid"), equalTo(inviteUid))
            } else if (accountUid) {
                userQuery = query(ref(getFirebaseDatabase(), DatabaseRoutes.PUBLIC_ACCOUNT_LINK_INVITES), orderByChild("accountUid"), equalTo(accountUid))
            }

            if (!userQuery) {
                resolve(null)
                return
            }

            get(userQuery).then((snapshot) => {
                if (snapshot.exists() && snapshot.val()) {
                    resolve(Object.values(snapshot.val())[0] as LinkInvite)
                } else {
                    resolve(null)
                }
            }).catch((error) => {
                reject(error)
            })
        })
    }

    getDBUserByUid(uid: string): Promise<UserDataModel | null> {
        return new Promise<UserDataModel | null>((resolve, reject) => {
            const userQuery = query(ref(getFirebaseDatabase(), DatabaseRoutes.USER_DATA), orderByChild("uid"), equalTo(uid))

            get(userQuery).then((snapshot) => {
                if (snapshot.exists() && snapshot.val()) {
                    resolve(Object.values(snapshot.val())[0] as UserDataModel)
                } else {
                    resolve(null)
                }
            }).catch((error) => {
                reject(error)
            })
        })
    }

    dbLogout(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            signOut(getFirebaseAuth()).then(() => {
                getActiveDatabaseHelper(DatabaseType.ACE_BASE).setDBObject(DatabaseRoutes.SETTINGS, new SettingsModel())
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    }

    dbSignUp(user: UserDataModel, password: string, newAccount: AccountModel): Promise<UserDataModel> {
        return new Promise<UserDataModel>((resolve, reject) => {
            createUserWithEmailAndPassword(getFirebaseAuth(), user.email, password).then((userCredential) => {
                user.uid = userCredential.user.uid
                createNewUser(
                    user,
                    newAccount
                ).then((newDBUser) => {
                    resolve(newDBUser)
                })

                signInWithEmailAndPassword(getFirebaseAuth(), user.email, password).then(() => {
                    updateProfile(userCredential.user, {
                        displayName: user.name
                    }).then(() => {
                        resolve(
                            {
                                ...user,
                                uid: userCredential.user.uid
                            } as UserDataModel
                        )
                    })
                })
            }).catch((error) => {
                reject(error)
            });
        })
    }
}