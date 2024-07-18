import {useEffect, useState} from "react";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {useDatabaseRoute} from "./useDatabaseRoute";
import {UserModel} from "../../Data/DatabaseModels/UserModel";
import {getActiveDatabaseHelper} from "../../Helper/Database/ActiveDBHelper";

export const useUsers = () => {
    const getDatabaseRoute = useDatabaseRoute(false)
    const [users, setUsers] = useState<UserModel[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getActiveDatabaseHelper().getDBItemsOnChange(
            DatabaseRoutes.USERS,
            setUsers
        )
    }, [getDatabaseRoute]);

    return users
}