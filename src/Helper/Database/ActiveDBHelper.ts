import {DatabaseType} from "../../Data/EnumTypes/DatabaseType";
import {AceBaseHelper} from "./AceBaseHelper";
import {FirebaseHelper} from "./FirebaseHelper";
import {DatabaseHelper} from "./DatabaseHelper";
import {AccountType} from "../../Data/EnumTypes/AccountType";
import {getDefaultDebtPresets, getDefaultPresets} from "../DefaultPresetHelper";
import {DatabaseRoutes} from "../DatabaseRoutes";
import {AccountModel} from "../../Data/DatabaseModels/AccountModel";
import {UserModel} from "../../Data/DatabaseModels/UserModel";
import uuid from "react-uuid";

export const getActiveDatabaseHelper = (databaseType: DatabaseType = DatabaseType.ACE_BASE): DatabaseHelper => {
    switch (databaseType) {
        case DatabaseType.ACE_BASE:
            return new AceBaseHelper()
        case DatabaseType.FIREBASE:
            return new FirebaseHelper()
    }
}

export const createNewUser = (newUser: UserModel, newAccount: AccountModel) => {
    return new Promise<UserModel>((resolve, reject) => {
        if (!newUser.uid) {
            newUser.uid = uuid()
        }

        newAccount.uid = uuid();
        newUser.currentAccountUid = newAccount.uid;

        getActiveDatabaseHelper().addDBItem(DatabaseRoutes.USERS, newUser).then(() => {
            newAccount.userUid = newUser.uid;

            getActiveDatabaseHelper().addDBItem(`${DatabaseRoutes.USERS}/${newUser.uid}/${DatabaseRoutes.ACCOUNTS}`, newAccount).then(() => {
                addPresetsForAccount(newUser.uid, newAccount);
                resolve(newUser);
            }).catch((error) => {
                reject(error);
            });
        }).catch((error) => {
            reject(error);
        });
    })
}

export const addPresetsForAccount = (userUid: string, newAccount: AccountModel) => {
    let presets;

    if (newAccount.type === AccountType.DEFAULT) {
        presets = getDefaultPresets(newAccount.currencyCode, newAccount.uid);
    } else {
        presets = getDefaultDebtPresets(newAccount.currencyCode, newAccount.uid);
    }

    presets.forEach(preset => {
        getActiveDatabaseHelper().addDBItem(`${DatabaseRoutes.USERS}/${userUid}/${DatabaseRoutes.ACCOUNTS}/${newAccount.uid}/${DatabaseRoutes.PRESETS}`, preset);
    });
}