import {TransactionModel} from "../Data/DatabaseModels/TransactionModel";
import {useEffect, useState} from "react";
import {getDBItemsOnChange} from "../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";
import {useCurrentAccount} from "../Providers/AccountProvider";
import {LabelModel} from "../Data/DatabaseModels/LabelModel";
import {useDatabaseRoute} from "./useDatabaseRoute";
import {AccountModel} from "../Data/DatabaseModels/AccountModel";
import {UserModel} from "../Data/DatabaseModels/UserModel";

export const useUsers = () => {
    const getDatabaseRoute = useDatabaseRoute(false)
    const [users, setUsers] = useState<UserModel[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getDBItemsOnChange(
            DatabaseRoutes.USERS,
            setUsers
        )
    }, [getDatabaseRoute]);

    return users
}