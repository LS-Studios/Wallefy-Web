import React, {useEffect} from 'react';
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {SortType} from "../../../Data/EnumTypes/SortType";
import {InputOptionModel} from "../../../Data/DataModels/Input/InputOptionModel";
import {MdRadioButtonChecked, MdRadioButtonUnchecked} from "react-icons/md";

import './OptionDialog.scss';
import {useDialog} from "../../../Providers/DialogProvider";
import {useTranslation} from "../../../CustomHooks/useTranslation";

function OptionDialog <T>({
    currentOption,
    onOptionChange,
    options,
}: {
    currentOption: InputOptionModel<T>,
    onOptionChange: (option: InputOptionModel<T>) => void,
    options: InputOptionModel<T>[],
}) {
    const dialog = useDialog();

    const setOption = (option: InputOptionModel<T>) => {
        onOptionChange(option);
        dialog.closeCurrent()
    }

    return (
        <DialogOverlay actions={[]}>
            <div className="option-dialog">
                { options.map((option) => (
                    <div
                        className="option-dialog-item"
                        onClick={() => setOption(option)}
                    >
                        <span id="option-dialog-item-name">{option.name}</span>
                        { currentOption === option ?
                            <MdRadioButtonChecked id="option-dialog-item-icon" /> :
                            <MdRadioButtonUnchecked id="option-dialog-item-icon"/>
                        }
                    </div>
                ))}
            </div>
        </DialogOverlay>
    );
};

export default OptionDialog;