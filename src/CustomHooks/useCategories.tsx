import {TransactionModel} from "../Data/DatabaseModels/TransactionModel";
import {useEffect, useState} from "react";
import {getDBItemsOnChange} from "../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";
import {TransactionPartnerModel} from "../Data/DatabaseModels/TransactionPartnerModel";
import {useCurrentAccount} from "../Providers/AccountProvider";
import {CategoryModel} from "../Data/DatabaseModels/CategoryModel";
import {useDatabaseRoute} from "./useDatabaseRoute";

export const useCategories = () => {
    const getDatabaseRoute = useDatabaseRoute()

    const [categories, setCategories] = useState<CategoryModel[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getDBItemsOnChange(
            getDatabaseRoute(DatabaseRoutes.CATEGORIES),
            setCategories
        )
    }, [getDatabaseRoute]);

    return categories
}