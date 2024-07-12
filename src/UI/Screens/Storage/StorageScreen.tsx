import React, {useEffect} from 'react';
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {StorageItemModel} from "../../../Data/DatabaseModels/StorageItemModel";
import StorageItem from "./StorageItem/StorageItem";

import '../TransactionListScreen.scss';
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useTransactionPartners} from "../../../CustomHooks/useTransactionPartners";
import {useCategories} from "../../../CustomHooks/useCategories";
import {useLabels} from "../../../CustomHooks/useLabels";
import Spinner from "../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../Data/EnumTypes/SpinnerType";

const StorageScreen = ({
    searchValue,
}: {
    searchValue: string,
}) => {
    const translate = useTranslation()

    const [currentTab, setCurrentTab] = React.useState<number>(0);

    const [storageItems, setStorageItems] = React.useState<StorageItemModel[] | null>(null);

    const transactionPartners = useTransactionPartners()
    const categories = useCategories()
    const labels = useLabels()

    const [filteredStorageItems, setFilteredStorageItems] = React.useState<StorageItemModel[] | null>(null);

    useEffect(() => {
        switch (currentTab) {
            case 0:
                setStorageItems(transactionPartners?.map(transactionPartner => new StorageItemModel(transactionPartner, DatabaseRoutes.TRANSACTION_PARTNERS)) || null);
                break;
            case 1:
                setStorageItems(categories?.map(category => new StorageItemModel(category, DatabaseRoutes.CATEGORIES)) || null);
                break;
            case 2:
                setStorageItems(labels?.map(label => new StorageItemModel(label, DatabaseRoutes.LABELS)) || null);
                break;
        }
    }, [currentTab, transactionPartners, categories, labels]);

    useEffect(() => {
        setFilteredStorageItems(storageItems?.filter(storageItem => storageItem.item.name.toLowerCase().includes(searchValue.toLowerCase())) || null)
    }, [storageItems, searchValue]);

    return (
        <div className="list-screen">
            <div className="screen-tabs">
                <span className={currentTab === 0 ? "selected" : ""} onClick={() => {
                    setCurrentTab(0)
                }}>{translate("transaction-partners")}</span>
                <span className={currentTab === 1 ? "selected" : ""} onClick={() => {
                    setCurrentTab(1)
                }}>{translate("categories")}</span>
                <span className={currentTab === 2 ? "selected" : ""} onClick={() => {
                    setCurrentTab(2)
                }}>{translate("labels")}</span>
            </div>
            <div className="screen-list-items">
                {
                    filteredStorageItems ? (
                        filteredStorageItems.length > 0 ? filteredStorageItems.map((item, index) => (
                            <StorageItem key={index} storageItem={item} translate={translate} />
                        )) : <span className="no-items">{translate("no-items")}</span>) :
                        <Spinner type={SpinnerType.CYCLE} />
                }
            </div>
        </div>
    );
};

//TODO [] show distribution in detail
//TODO [] on click pi chart open dialog with corresponding transactions
//TODO [] when refresh, settings theme and language get rested
//TODO [] When refresh jump to home and not stay on the same page
//TODO [] Cant change current account in settings -> BUG
//TODO [] If chart balance is selected, not turn it white, but make the other bars opacity 0.5
//TODO [] Help screen with Chat
//TODO [] Chatbot which is able to create transactions and read data
//TODO [] Mobile Screens

export default StorageScreen;