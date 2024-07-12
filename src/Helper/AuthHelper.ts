import {addDBItem, doPathExist, getDBObject, getNewDBRef, updateDBItem} from "./AceBaseHelper";
import {DatabaseRoutes} from "./DatabaseRoutes";
import {UserModel} from "../Data/DatabaseModels/UserModel";
import {AuthenticationErrorModel} from "../Data/ErrorModels/AuthenticationErrorModel";
import {DataReference} from "acebase";
import {AccountModel} from "../Data/DatabaseModels/AccountModel";

export function login(email: string, password: string): Promise<UserModel> {
    return new Promise<UserModel>((resolve, reject) => {
        const errorModel = new AuthenticationErrorModel()

        if (email === "") {
            reject({
                ...errorModel,
                emailError: true,
            } as AuthenticationErrorModel)
        } else if (password === "") {
            reject({
                ...errorModel,
                passwordError: true,
            } as AuthenticationErrorModel)
        } else {
            getDBObject(DatabaseRoutes.USERS).then((users: UserModel[]) => {
                if (users === null) {
                    reject({
                        ...errorModel,
                        userNotFound: true,
                    } as AuthenticationErrorModel)
                    return;
                }
                const user = Object.values(users).find((user: UserModel) => {
                    return user.email === email && user.password === password
                })
                if (user === undefined) {
                    reject({
                        ...errorModel,
                        userNotFound: true,
                    } as AuthenticationErrorModel)
                    return;
                }
                resolve(user)
            })
        }
    })
}

export function signup(translate: (key: string) => string, user: UserModel): Promise<UserModel> {
    return new Promise<UserModel>((resolve, reject) => {
        const errorModel = new AuthenticationErrorModel()

        if (user.email === "") {
            reject({
                ...errorModel,
                emailError: true,
            } as AuthenticationErrorModel)
        } else if (user.password === "") {
            reject({
                ...errorModel,
                passwordError: true,
            } as AuthenticationErrorModel)
        } else {
            doPathExist(DatabaseRoutes.USERS).then((pathExist) => {
                const createUser = () => {
                    const ref = getNewDBRef(DatabaseRoutes.USERS)
                    user.uid = ref.key

                    const newAccount = new AccountModel(
                        translate("private-account"),
                        0.00,
                    )

                    newAccount.userId = user.uid

                    addDBItem(DatabaseRoutes.USERS, user).then(() => {
                        addDBItem(`${DatabaseRoutes.USERS}/${user.uid}/${DatabaseRoutes.ACCOUNTS}`, newAccount).then(() => {
                            user.currentAccountId = newAccount.uid
                            updateDBItem(`${DatabaseRoutes.USERS}`, user).then(() => {
                                resolve(user as UserModel)
                            })
                        })
                    })
                }

                if (!pathExist) {
                    createUser()
                } else {
                    getDBObject(DatabaseRoutes.USERS).then((users: UserModel[]) => {
                        const existingUser = Object.values(users).find((existingUser: UserModel) => {
                            return existingUser.email === user.email
                        })
                        if (existingUser !== undefined) {
                            reject({
                                ...errorModel,
                                emailAlreadyInUse: true,
                            } as AuthenticationErrorModel)
                            return;
                        }
                        createUser()
                    })
                }
            })
        }
    })
}