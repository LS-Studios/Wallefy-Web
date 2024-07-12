import {CreateDialogNewItems} from "../Data/DataModels/CreateDialogNewItems";
import {DBItem} from "../Data/DatabaseModels/DBItem";
import uuid from "react-uuid";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";
import {InputNameValueModel} from "../Data/DataModels/Input/InputNameValueModel";
import {ContentAction} from "../Data/ContentAction/ContentAction";
import {DialogModel} from "../Data/DataModels/DialogModel";
import EditStorageItemDialog from "../UI/Dialogs/EditStorageItemDialog/EditStorageItemDialog";
import {StorageItemModel} from "../Data/DatabaseModels/StorageItemModel";
import {deleteDBItemByUid, getDBItemByUid} from "../Helper/AceBaseHelper";
import React from "react";
import {useTranslation} from "./useTranslation";
import {useDialog} from "../Providers/DialogProvider";
import {useDatabaseRoute} from "./useDatabaseRoute";
import {TransactionPartnerModel} from "../Data/DatabaseModels/TransactionPartnerModel";

export const useNewItems = (
    workItem: DBItem | null,
    setWorkItem: React.Dispatch<React.SetStateAction<DBItem | null>>,
) => {
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
                        deleteDBItemByUid(
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

    const checkDBItem = (item: DBItem, databaseRoute: DatabaseRoutes, key: string) => {
        // @ts-ignore
        if (Array.isArray(item[key])) {
            // @ts-ignore
            item[key].forEach((itemUid) => {
                getDBItemByUid(
                    getDatabaseRoute!(databaseRoute),
                    itemUid
                ).then((whoWasPaiFor) => {
                    if (!whoWasPaiFor) {
                        setWorkItem((oldItem) => {
                            // @ts-ignore
                            oldItem[key] = oldItem[key].filter((uid) => uid !== itemUid)
                            return oldItem
                        })
                    }
                })
            })
        } else {
            getDBItemByUid(
                getDatabaseRoute!(databaseRoute),
                // @ts-ignore
                item[key]
            ).then((item) => {
                if (!item) {
                    setWorkItem((oldItem) => {
                        // @ts-ignore
                        oldItem[key] = null
                        return oldItem
                    })
                }
            })
        }
    }



    return {
        newItems,
        addNewItems,
        getDbItemContextMenuOptions,
        checkDBItem
    }
}