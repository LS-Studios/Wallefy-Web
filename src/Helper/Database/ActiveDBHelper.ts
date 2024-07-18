import {DatabaseType} from "../../Data/EnumTypes/DatabaseType";
import {AceBaseHelper} from "./AceBaseHelper";
import {FirebaseHelper} from "./FirebaseHelper";
import {DatabaseHelper} from "./DatabaseHelper";

export const getActiveDatabaseHelper = (databaseType: DatabaseType = DatabaseType.ACE_BASE): DatabaseHelper => {
    switch (databaseType) {
        case DatabaseType.ACE_BASE:
            return new AceBaseHelper()
        case DatabaseType.FIREBASE:
            return new FirebaseHelper()
    }
}