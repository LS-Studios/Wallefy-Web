import {useEffect, useState} from "react";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {CategoryModel} from "../../Data/DatabaseModels/CategoryModel";
import {useDatabaseRoute} from "./useDatabaseRoute";
import {getActiveDatabaseHelper} from "../../Helper/Database/ActiveDBHelper";

export const useCategories = () => {
    const getDatabaseRoute = useDatabaseRoute()

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