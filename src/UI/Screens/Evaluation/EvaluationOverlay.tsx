import React from 'react';
import ContentOverlay from "../../ContentOverlay/ContentOverlay";
import {MdBolt, MdHome, MdTune} from "react-icons/md";
import EvaluationScreen from "./EvaluationScreen";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {useDialog} from "../../../Providers/DialogProvider";
import {DialogModel} from "../../../Data/DataModels/DialogModel";
import CashCheckDialog from "../../Dialogs/CashCheckDialog/CashCheckDialog";

const EvaluationOverlay = () => {
    const dialog = useDialog()
    const translate = useTranslation()

    return (
        <ContentOverlay
            title={translate("evaluation")}
            titleIcon={<MdHome />}
            actions={[
                new ContentAction(
                    translate("cash-check"),
                    () => {
                        dialog.open(
                            new DialogModel(
                                translate("cash-check"),
                                <CashCheckDialog />,
                            )
                        )
                    },
                    false,
                    false,
                    <MdBolt />
                )
            ]}
        >
            <EvaluationScreen />
        </ContentOverlay>
    );
};

export default EvaluationOverlay;