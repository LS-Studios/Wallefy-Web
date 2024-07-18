import {CreateDialogNewItems} from "../Data/DataModels/CreateDialogNewItems";
import {DBItem} from "../Data/DatabaseModels/DBItem";
import uuid from "react-uuid";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";
import {InputNameValueModel} from "../Data/DataModels/Input/InputNameValueModel";
import {ContentAction} from "../Data/ContentAction/ContentAction";
import {DialogModel} from "../Data/DataModels/DialogModel";
import EditStorageItemDialog from "../UI/Dialogs/EditStorageItemDialog/EditStorageItemDialog";
import {StorageItemModel} from "../Data/DatabaseModels/StorageItemModel";
import React from "react";
import {useTranslation} from "./useTranslation";
import {useDialog} from "../Providers/DialogProvider";
import {useDatabaseRoute} from "./Database/useDatabaseRoute";
import {getActiveDatabaseHelper} from "../Helper/Database/ActiveDBHelper";

export const useNewItems = () => {
    const getDatabaseRoute = useDatabaseRoute()
    const dialog = useDialog()
    const translate = useTranslation()
    const [newItems, setNewItems] = React.useState(new CreateDialogNewItems())

    const updateNewItemsState = (updater: (oldNewItems: CreateDialogNewItems) => CreateDialogNewItems) => {
        setNewItems((oldNewItems) => {
            const newNewItems = new CreateDialogNewItems()
            Object.assign(newNewItems, updater(oldNewItems));
            return newNewItems
        })
    }

    const addNewItems = (newItem: DBItem, newItemsKey: keyof CreateDialogNewItems) => {
        newItem.uid = uuid()
        updateNewItemsState((oldItems) => {
            // @ts-ignore
            oldItems[newItemsKey] = [...oldItems[newItemsKey], newItem]
            return oldItems
        })
        return newItem
    }

    const getDbItemContextMenuOptions = (databaseRoute: DatabaseRoutes, newItemsKey: keyof CreateDialogNewItems, value: InputNameValueModel<DBItem>) => {
        const updateNewItems = (newItem: DBItem, newItemsKey: keyof CreateDialogNewItems) => {
            const newDBItem = {
                ...newItem,
                name: newItem.name
            } as DBItem

            updateNewItemsState((oldItems) => {
                // @ts-ignore
                oldItems[newItemsKey] = oldItems[newItemsKey].map(item => item.uid === newItem.uid ? newDBItem : item)
                return oldItems
            })
            return newDBItem
        }

        const deleteNewItems = (newItem: DBItem, newItemsKey: keyof CreateDialogNewItems) => {
            updateNewItemsState((oldItems) => {
                // @ts-ignore
                oldItems[newItemsKey] = oldItems[newItemsKey].filter(item => item.uid !== newItem.uid)
                return oldItems
            })
        }

        return [
            new ContentAction(
                translate("edit"),
                () => {
                    dialog.open(
                        new DialogModel(
                            translate("edit-transaction-partner"),
                            <EditStorageItemDialog
                                storageItem={new StorageItemModel(value.value!, databaseRoute)}
                                // @ts-ignore
                                isTempItem={newItems[newItemsKey].includes(value.value!)}
                                onEdit={(newStorageItem) => {
                                    updateNewItems(newStorageItem.item, newItemsKey)
                                }}
                                onDelete={() => {
                                    deleteNewItems(value.value!, newItemsKey)
                                }}
                            />
                        )
                    )
                }
            ),
            new ContentAction(
                translate("delete"),
                () => {
                    // @ts-ignore
                    if (newItems[newItemsKey].includes(value.value!)) {
                        deleteNewItems(value.value!, newItemsKey)
                    } else {
                        getActiveDatabaseHelper().deleteDBItemByUid(
                            getDatabaseRoute!(databaseRoute),
                            value.value!.uid
                        )
                    }
                },
                false,
                getDatabaseRoute === null
            )
        ]
    }

    const checkDBItem = (item: DBItem, databaseRoute: DatabaseRoutes, key: string, newItemFromFallback: DBItem | { [uid: string]: DBItem }, newItemsKey: keyof CreateDialogNewItems,) => {
        return new Promise<DBItem>((resolve) => {
            if (!getDatabaseRoute) {
                resolve(item)
                return
            }

            // @ts-ignore
            if (Array.isArray(item[key])) {
                // @ts-ignore
                const promises = item[key].map((itemUid) => {
                    getActiveDatabaseHelper().getDBItemByUid(
                        getDatabaseRoute!(databaseRoute),
                        itemUid
                    ).then((whoWasPaiFor) => {
                        if (!whoWasPaiFor) {
                            // @ts-ignore
                            item[key] = addNewItems(
                                (newItemFromFallback as { [uid: string]: DBItem })[itemUid],
                                newItemsKey
                            ).uid
                        }
                    })
                })

                Promise.all(promises).then(() => {
                    resolve(item)
                })
            } else {
                getActiveDatabaseHelper().getDBItemByUid(
                    getDatabaseRoute!(databaseRoute),
                    // @ts-ignore
                    item[key]
                ).then((foundItem) => {
                    if (!foundItem) {
                        // @ts-ignore
                        item[key] = addNewItems(
                            newItemFromFallback as DBItem,
                            newItemsKey
                        ).uid
                    }

                    resolve(item)
                })
            }
        })
    }

    const clearNewItems = () => {
        setNewItems(new CreateDialogNewItems())
    }

    return {
        newItems,
        clearNewItems,
        addNewItems,
        getDbItemContextMenuOptions,
        checkDBItem
    }
}