import React, {useEffect} from 'react';
import './CreateTransactionScreen.scss';
import CreateTransactionPresetSlot from "./PresetSlot/CreateTransactionPresetSlot";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {usePresets} from "../../../CustomHooks/Database/usePresets";
import Spinner from "../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../Data/EnumTypes/SpinnerType";
import {getDefaultPresets} from "../../../Helper/DefaultPresetHelper";

const CreateTransactionScreen = () => {
    const translate = useTranslation()

    const presets = usePresets()

    return (
        <div className="create-transaction">
            <h2>{translate("presets")}</h2>
            { presets ? (
                presets.length > 0 ? (
                    <div className="create-transaction-presets">
                        {
                            presets.map((preset, index) => (
                                <CreateTransactionPresetSlot
                                    key={index}
                                    preset={preset}
                                    isBasic={false}
                                />
                            ))
                        }
                    </div>
                ) : <span className="create-transaction-no-presets">{translate("no-presets")}</span>
            ) : <Spinner type={SpinnerType.CYCLE} />}
        </div>
    );
};

export default CreateTransactionScreen;