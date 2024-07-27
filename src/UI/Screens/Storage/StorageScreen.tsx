import React, {useEffect} from 'react';
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {StorageItemModel} from "../../../Data/DatabaseModels/StorageItemModel";
import StorageItem from "./StorageItem/StorageItem";

import '../TransactionListScreen.scss';
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useTransactionPartners} from "../../../CustomHooks/Database/useTransactionPartners";
import {useCategories} from "../../../CustomHooks/Database/useCategories";
import {useLabels} from "../../../CustomHooks/Database/useLabels";
import Spinner from "../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../Data/EnumTypes/SpinnerType";
import SelectionInput from "../../Components/SelectionInput/SelectionInput";
import {useScreenScaleStep} from "../../../CustomHooks/useScreenScaleStep";
import {InputOptionModel} from "../../../Data/DataModels/Input/InputOptionModel";

const StorageScreen = ({
    searchValue,
}: {
    searchValue: string,
}) => {
    const translate = useTranslation()
    const screenScaleStep = useScreenScaleStep()

    const [currentTab, setCurrentTab] = React.useState<number>(0);

    const [storageItems, setStorageItems] = React.useState<StorageItemModel[] | null>(null);

    const transactionPartners = useTransactionPartners()
    const categories = useCategories()
    const labels = useLabels()

    const [filteredStorageItems, setFilteredStorageItems] = React.useState<StorageItemModel[] | null>(null);

    const tabOptions= [
        new InputOptionModel(translate("transaction-partners"), 0),
        new InputOptionModel(translate("categories"), 1),
        new InputOptionModel(translate("labels"), 2)
    ]

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
        setFilteredStorageItems(storageItems?.filter(storageItem => storageItem.item.name?.toLowerCase().includes(searchValue.toLowerCase())) || null)
    }, [storageItems, searchValue]);

    return (
        <div className="list-screen">
            { screenScaleStep === 2 ? <SelectionInput
                value={tabOptions.find((option) => option.value === currentTab) || tabOptions[0]}
                onValueChanged={(value) => setCurrentTab(value.value)}
                options={tabOptions}
            /> : <div className="screen-tabs">
                <span className={currentTab === 0 ? "selected" : ""} onClick={() => {
                    setCurrentTab(0)
                }}>{translate("transaction-partners")}</span>
                <span className={currentTab === 1 ? "selected" : ""} onClick={() => {
                    setCurrentTab(1)
                }}>{translate("categories")}</span>
                <span className={currentTab === 2 ? "selected" : ""} onClick={() => {
                    setCurrentTab(2)
                }}>{translate("labels")}</span>
            </div> }
            <div className="screen-list-items">
                {
                    filteredStorageItems ? (
                            filteredStorageItems.length > 0 ? filteredStorageItems.map((item, index) => (
                                <StorageItem key={index} storageItem={item} translate={translate}/>
                            )) : <span className="no-items">{translate("no-items")}</span>) :
                        <Spinner type={SpinnerType.CYCLE}/>
                }
            </div>
        </div>
    );
};

//TODO [] Implement Caching
//TODO [] Popup dialog to put the current balance and recent transactions
//TODO [] Help screen with Totrial buttons (How to create public account, ...)
//TODO [] Implement encription

export default StorageScreen;