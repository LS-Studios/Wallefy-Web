import {getAceBaseDatabase} from "../../Database/AceBaseDatabase";
import {DBItem} from "../../Data/DatabaseModels/DBItem";
import {ref, get, child, push, set, remove, update, onValue} from "firebase/database";
import {getFirebaseAuth, getFirebaseDatabase} from "../../Database/FirebaseDatabase";
import {signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile} from "firebase/auth";
import {UserModel} from "../../Data/DatabaseModels/UserModel";
import {DatabaseRoutes} from "../DatabaseRoutes";
import {SettingsModel} from "../../Data/DataModels/SettingsModel";
import {DatabaseHelper} from "./DatabaseHelper";
import {AccountModel} from "../../Data/DatabaseModels/AccountModel";
import {addPresetsForAccount, createNewUser, getActiveDatabaseHelper} from "./ActiveDBHelper";
import {DatabaseType} from "../../Data/EnumTypes/DatabaseType";

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
            if (!snapshot.exists()) {
                onChange([])
                return;
            }
            const items: T[] = []
            snapshot.forEach((childSnapshot) => {
                items.push(childSnapshot.val())
                return true
            })
            onChange(items)
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

    getDBObject<T>(path: string): Promise<T | null> {
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

    getDBObjects<T>(path: string): Promise<T[]> {
        return new Promise<any | null>((resolve, reject) => {
            get(ref(getFirebaseDatabase(), path)).then((snapshot) => {
                if (!snapshot.exists()) {
                    resolve([])
                    return;
                }
                const items: any[] = []
                Object.values(snapshot).forEach((childSnapshot) => {
                    items.push(childSnapshot.val())
                    return true
                })
                resolve(items)
            }).catch((error) => {
                reject(error)
            });
        })
    }

    getDBObjectOnChange<T>(path: string, onChange: (item: T | null) => void): void {
        onValue(ref(getFirebaseDatabase(), path), (snapshot) => {
            if (!snapshot.exists()) {
                onChange(null)
                return;
            }
            onChange(snapshot.val())
        })
    }

    setDBObject<T>(path: string, item: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            set(ref(getFirebaseDatabase(), path), item).then(() => {
                resolve(item)
            }).catch((error) => {
                reject(error)
            });
        })
    }

    dbLogin(email: string, password: string): Promise<UserModel> {
        return new Promise<UserModel>((resolve, reject) => {
            signInWithEmailAndPassword(getFirebaseAuth(), email, password).then((userCredential) => {
                resolve(
                    new UserModel(
                        userCredential.user.uid,
                        userCredential.user.displayName!,
                        userCredential.user.email!,
                    )
                )
            }).catch((error) => {
                reject(error)
            });
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

    dbSignUp(user: UserModel, newAccount: AccountModel): Promise<UserModel> {
        return new Promise<UserModel>((resolve, reject) => {
            createUserWithEmailAndPassword(getFirebaseAuth(), user.email, user.password).then((userCredential) => {
                user.uid = userCredential.user.uid
                createNewUser(
                    user,
                    newAccount
                ).then((newDBUser) => {
                    resolve(newDBUser)
                })

                signInWithEmailAndPassword(getFirebaseAuth(), user.email, user.password).then(() => {
                    updateProfile(userCredential.user, {
                        displayName: user.name
                    }).then(() => {
                        resolve(
                            new UserModel(
                                userCredential.user.uid,
                                user.name,
                                user.email,
                            )
                        )
                    })
                })
            }).catch((error) => {
                reject(error)
            });
        })
    }
}