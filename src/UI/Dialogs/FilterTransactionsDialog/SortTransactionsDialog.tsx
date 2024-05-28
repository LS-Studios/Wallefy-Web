import React from 'react';
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {SortType} from "../../../Data/SortType";
import {InputOptionModel} from "../../../Data/Input/InputOptionModel";
import {MdRadioButtonChecked, MdRadioButtonUnchecked} from "react-icons/md";

import './SortTransactionsDialog.scss';
import {useDialog} from "../../../Providers/DialogProvider";

const SortTransactionsDialog = ({
    sortType,
    onSortTypeChange,
}: {
    sortType: SortType,
    onSortTypeChange: (sortType: SortType) => void,
}) => {
    const dialog = useDialog();

    const sortTypeOptions = [
        new InputOptionModel("Newest first", SortType.NEWEST_FIRST),
        new InputOptionModel("Price low to high", SortType.PRICE_LOW_TO_HIGH),
        new InputOptionModel("Price high to low", SortType.PRICE_HIGH_TO_LOW),
    ];

    const setSortType = (sortType: SortType) => {
        onSortTypeChange(sortType);
        dialog.closeCurrent()
    }

    return (
        <DialogOverlay actions={[]}>
            <div className="sort-transactions-dialog">
                { sortTypeOptions.map((option) => (
                    <div
                        className="sort-transactions-dialog-item"
                        onClick={() => setSortType(option.value)}
                    >
                        <span id="sort-transactions-dialog-item-name">{option.name}</span>
                        { sortType === option.value ?
                            <MdRadioButtonChecked id="sort-transactions-dialog-item-icon" /> :
                            <MdRadioButtonUnchecked id="sort-transactions-dialog-item-icon"/>
                        }
                    </div>
                ))}
            </div>
        </DialogOverlay>
    );
};

export default SortTransactionsDialog;