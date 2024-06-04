import React, {useEffect} from 'react';

import {getDBItemsOnChange} from "../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {TransactionPartnerModel} from "../../../Data/TransactionPartnerModel";
import {CategoryModel} from "../../../Data/CategoryModel";
import {LabelModel} from "../../../Data/LabelModel";
import {StorageItemModel} from "../../../Data/StorageItemModel";
import StorageItem from "./StorageItem/StorageItem";

import '../TransactionListScreen.scss';

const StorageScreen = ({
    searchValue,
}: {
    searchValue: string,
}) => {
    const [currentTab, setCurrentTab] = React.useState<number>(0);

    const [storageItems, setStorageItems] = React.useState<StorageItemModel[]>([]);

    useEffect(() => {
        switch (currentTab) {
            case 0:
                getDBItemsOnChange(DatabaseRoutes.TRANSACTION_PARTNERS, (transactionPartners: TransactionPartnerModel[]) => {
                    setStorageItems(transactionPartners.map(transactionPartner => new StorageItemModel(transactionPartner, DatabaseRoutes.TRANSACTION_PARTNERS)));
                })
                break;
            case 1:
                getDBItemsOnChange(DatabaseRoutes.CATEGORIES, (categories: CategoryModel[]) => {
                    setStorageItems(categories.map(category => new StorageItemModel(category, DatabaseRoutes.CATEGORIES)));
                })
                break;
            case 2:
                getDBItemsOnChange(DatabaseRoutes.LABELS, (labels: LabelModel[]) => {
                    setStorageItems(labels.map(label => new StorageItemModel(label, DatabaseRoutes.LABELS)));
                })
                break;
        }
    }, [currentTab]);

    return (
        <div className="list-screen">
            <div className="screen-tabs">
                <span className={currentTab === 0 ? "selected" : ""} onClick={() => {
                    setCurrentTab(0)
                }}>Transaction partners</span>
                <span className={currentTab === 1 ? "selected" : ""} onClick={() => {
                    setCurrentTab(1)
                }}>Categories</span>
                <span className={currentTab === 2 ? "selected" : ""} onClick={() => {
                    setCurrentTab(2)
                }}>Labels</span>
            </div>
            <div className="screen-list-items">
                {
                    storageItems.map((item, index) => (
                        <StorageItem key={index} storageItem={item} />
                    ))
                }
            </div>
        </div>
    );
};

export default StorageScreen;