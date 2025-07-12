import {useEffect, useState} from "react";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {CategoryModel} from "../../Data/DatabaseModels/CategoryModel";
import {useAccountRoute} from "./useAccountRoute";
import {getActiveDatabaseHelper} from "../../Helper/Database/ActiveDBHelper";

export const useCategories = () => {
    const getDatabaseRoute = useAccountRoute()

    const [categories, setCategories] = useState<CategoryModel[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getActiveDatabaseHelper().getDBItemsOnChange(
            getDatabaseRoute(DatabaseRoutes.CATEGORIES),
            setCategories
        )
    }, [getDatabaseRoute]);

    return categories
}