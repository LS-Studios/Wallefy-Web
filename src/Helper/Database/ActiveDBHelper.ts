import {DatabaseType} from "../../Data/EnumTypes/DatabaseType";
import {AceBaseHelper} from "./AceBaseHelper";
import {FirebaseHelper} from "./FirebaseHelper";
import {DatabaseHelper} from "./DatabaseHelper";
import {AccountType} from "../../Data/EnumTypes/AccountType";
import {getDefaultDebtPresets, getDefaultPresets} from "../DefaultPresetHelper";
import {DatabaseRoutes} from "../DatabaseRoutes";
import {AccountModel} from "../../Data/DatabaseModels/AccountModel";
import uuid from "react-uuid";
import {TransactionPresetModel} from "../../Data/DatabaseModels/TransactionPresetModel";
import {DebtPresetModel} from "../../Data/DatabaseModels/DebtPresetModel";
import {UserDataModel} from "../../Data/DatabaseModels/UserDataModel";
import {AccountVisibilityType} from "../../Data/EnumTypes/AccountVisibilityType";

export const getActiveDatabaseHelper = (databaseType: DatabaseType = DatabaseType.FIREBASE): DatabaseHelper => {
    switch (databaseType) {
        case DatabaseType.ACE_BASE:
            return new AceBaseHelper()
        case DatabaseType.FIREBASE:
            return new FirebaseHelper()
    }
}

export const createNewUser = (newUser: UserDataModel, newAccount: AccountModel) => {
    return new Promise<UserDataModel>((resolve, reject) => {
        if (!newUser.uid) {
            newUser.uid = uuid()
        }

        getActiveDatabaseHelper().addDBItem(DatabaseRoutes.USER_DATA, newUser).then(() => {
            newAccount.userUid = newUser.uid;

            getActiveDatabaseHelper().addDBItem(`${DatabaseRoutes.USER_ACCOUNTS}/${newUser.uid}/${DatabaseRoutes.PRIVATE_ACCOUNTS}`, newAccount).then(() => {
                addPresetsForAccount(`${DatabaseRoutes.USER_ACCOUNTS}/${newUser.uid}/${DatabaseRoutes.PRIVATE_ACCOUNTS}/${newAccount.uid}`, newAccount)
                resolve(newUser);
            }).catch((error) => {
                reject(error);
            });
        }).catch((error) => {
            reject(error);
        });
    })
}

export const addPresetsForAccount = (accountRoute: string, newAccount: AccountModel) => {
    return new Promise<void>((resolve, reject) => {
        let presets;

        if (newAccount.type === AccountType.DEFAULT) {
            presets = getDefaultPresets(newAccount.currencyCode, newAccount.uid);
        } else {
            presets = getDefaultDebtPresets(newAccount.currencyCode, newAccount.uid);
        }

        const promises: Promise<TransactionPresetModel | DebtPresetModel>[] = []

        presets.forEach(preset => {
            promises.push(getActiveDatabaseHelper().addDBItem(`${accountRoute}/${DatabaseRoutes.PRESETS}`, preset));
        });

        Promise.all(promises).then(() => {
            resolve()
        })
    })
}

export const deleteUserFromPublicAccounts = (userUid: string, accountUid: string, done: () => void) => {
    getActiveDatabaseHelper().deleteDBObject(`${DatabaseRoutes.PUBLIC_ACCOUNT_USERS}/${accountUid}/${userUid}`).then(() => {
        done()

        getActiveDatabaseHelper().getDBObjects(`${DatabaseRoutes.PUBLIC_ACCOUNT_USERS}/${accountUid}`).then((users) => {
            if (users.length === 0) {
                getActiveDatabaseHelper().deleteDBObject(`${DatabaseRoutes.PUBLIC_ACCOUNTS}/${accountUid}`)
                getActiveDatabaseHelper().deleteDBObject(`${DatabaseRoutes.PUBLIC_ACCOUNT_INVITES}/${accountUid}`)
                getActiveDatabaseHelper().deleteDBObject(`${DatabaseRoutes.PUBLIC_ACCOUNT_LINK_INVITES}/${accountUid}`)
            }
        })
    })
}