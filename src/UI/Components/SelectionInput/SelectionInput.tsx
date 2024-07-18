import React, {useState} from 'react';
import {MdArrowDropDown, MdSearch} from "react-icons/md";
import './SelectionInput.scss';
import {InputOptionModel} from "../../../Data/DataModels/Input/InputOptionModel";
import DropDialog from "../Dropdialog/DropDialog";

const SelectionInput = ({
    value,
    onValueChanged,
    options
}: {
    value: InputOptionModel<number>,
    onValueChanged: (value: InputOptionModel<number>) => void,
    options: InputOptionModel<number>[]
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <DropDialog
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            content={<div>
                <div className="selection-input-options">
                    {options.map((option, index) => {
                        return (
                            <div key={index} className={value.value === option.value ? "selected" : ""} onClick={() => {
                                onValueChanged(option);
                                setIsOpen(false);
                            }}>
                                <span>{option.name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>}
            parentStyle={{width: "100%"}}
        >
            <div className={"selection-input" + (isOpen ? " open" : "")} onClick={() => {
                setIsOpen(!isOpen);
            }}>
                <span>{value.name}</span>
                <MdArrowDropDown className="selection-input-icon"/>
            </div>
        </DropDialog>
    );
};

export default SelectionInput;