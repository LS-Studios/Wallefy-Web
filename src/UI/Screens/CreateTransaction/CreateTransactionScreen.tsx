import React, {useEffect} from 'react';
import './CreateTransactionScreen.scss';
import {useDialog} from "../../../Providers/DialogProvider";
import {ExecutionType} from "../../../Data/Transactions/ExecutionType";
import {addDBItem, getDBItemsOnChange} from "../../../Helper/AceBaseHelper";
import {TransactionModel} from "../../../Data/Transactions/TransactionModel";
import {TransactionModelBuilder} from "../../../Data/Transactions/TransactionModelBuilder";
import {RepetitionModelBuilder} from "../../../Data/Transactions/RepetitionModelBuilder";
import {RepetitionRateType} from "../../../Data/Transactions/RepetitionRateType";
import {TransactionType} from "../../../Data/Transactions/TransactionType";
import {TransactionPresetModel} from "../../../Data/CreateScreen/TransactionPresetModel";
import CreateTransactionPresetSlot from "./PresetSlot/CreateTransactionPresetSlot";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import ContextMenuBase from "../../Components/ContextMenuBase/ContextMenuBase";
import {ContextMenuModel} from "../../../Data/Providers/ContextMenuModel";
import {defaultPresets} from "../../../Helper/ExampleDataHelper";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";

const CreateTransactionScreen = () => {
    const dialog = useDialog()

    const [standardPresets, setStandardPresets] = React.useState<TransactionPresetModel[]>([])
    const [presets, setPresets] = React.useState<TransactionPresetModel[]>([])

    useEffect(() => {
        // defaultPresets.forEach((preset) => {
        //     addDBItem("transaction-presets/standard", preset)
        // })
    }, []);

    useEffect(() => {
        getDBItemsOnChange(DatabaseRoutes.STANDARD_PRESETS, (presets: TransactionPresetModel[]) => {
            setStandardPresets(presets)
        })
        getDBItemsOnChange(DatabaseRoutes.CUSTOM_PRESETS, (presets: TransactionPresetModel[]) => {
            setPresets(presets)
        })
    }, []);

    return (
        <div className="create-transaction">
            <h2>Vorlagen</h2>
            <h3>Grundlegend</h3>
            <div className="create-transaction-presets">
                {standardPresets.map((preset, index) => (
                    <CreateTransactionPresetSlot
                        key={index}
                        preset={preset}
                        isBasic={true}
                    />
                ))}
            </div>
            <h3>Variable</h3>
            <div className="create-transaction-presets">
                {presets.map((preset, index) => (
                    <CreateTransactionPresetSlot
                        key={index}
                        preset={preset}
                        isBasic={false}
                    />
                ))}
            </div>
        </div>
    );
};

export default CreateTransactionScreen;